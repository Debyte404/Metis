import os
import asyncio
from schemas import ServerConfig, ResponseModel
import psutil, logging, httpx, time
from fastapi import HTTPException
import socket
# BitNet wrapper to run multiple llama.cpp servers concurrently
# and handle requests
logger = logging.getLogger(__name__)
HOST = "127.0.0.1"
BINARY_PATH = os.path.join(os.getenv("BUILD_DIR", "/app/BitNet/build"), "bin", "llama-server")

ACTIVE_SESSIONS = {}
# user_id -> {"port": int, "pid": int, "process": process, "last_active": float}

def getPort():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('',0))
        return s.getsockname()[1]

def getMemoryInfo():
    # checks memory usage of each identical process runnning
    memUsage = []
    for item in ACTIVE_SESSIONS.values():
        try:
            process = psutil.Process(item["pid"])
            memory_usage = process.memory_info().rss
            memUsage.append(memory_usage)
        except psutil.NoSuchProcess: # deal with zombie processes
            logger.warning("Process doesn't exist")
            continue
        except Exception as e:
            logger.error(f"Error: {e}")
            continue
    avgmem = sum(memUsage) / len(memUsage) if memUsage else 0
    return avgmem

async def safe_start_process(server_config: ServerConfig, x_user_id: str):
    process_avg_usage = getMemoryInfo()
    buffer = psutil.virtual_memory().total * 0.10 # maximum memory to be consumed
    memory_required = process_avg_usage * 1.5
    if (psutil.virtual_memory().available - memory_required) < buffer:
        session = ACTIVE_SESSIONS.get(x_user_id)
        if session is not None:
            logger.warning("Process already exists.")
            return ResponseModel(message="process already exists")
        port = str(getPort())
        command = [
            BINARY_PATH,
            '--port', port,
            '-t', server_config.threads,
            '-m', server_config.model,
            '-c', server_config.ctx_size,
            '--temp', server_config.temperature,
            '-p', server_config.system_prompt,
            '-n', server_config.tokens_predict,
            '-ngl', 0,
            '-b', "1",
        ]
        process = None
        try:
            logger.info(f"Starting llama.cpp server at port {port}....")
            process = await asyncio.create_subprocess_exec(
                command[0], *command[1:],
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.PIPE
            )
            await asyncio.sleep(2.0)
            if process.returncode is not None:
                stderr = process.stderr
                err = stderr.read().decode() if stderr else None
                logger.error(f"Error starting server at port {port} \
                             \nERROR: {err}")
                raise HTTPException(500, f"server failed to start at localhost:{port}")
            ACTIVE_SESSIONS[x_user_id] = {
                "port": port,
                "pid": process.pid,
                "process": process,
                "last_active": time.time()
            }
            logger.info(f"llama.cpp server started at localhost:{port}")
            return ResponseModel(f"llama.cpp server started at localhost:{port}")
        except Exception as e:
            # kill zombie process
            if process and process.returncode is not None:
                process.kill()
                await process.wait()
            ACTIVE_SESSIONS.pop(x_user_id, None)
            logger.error(f"Error starting server at port {port} \
                             \nERROR: {e}")
            raise HTTPException(500, f"server failed to start at localhost:{port}")
    else:
        logger.error("Could not start server: not enough memory")

async def kill_process(x_user_id: str):
    session = ACTIVE_SESSIONS.get(x_user_id)
    if session:
        process = session["process"]
        port = session["port"]
        if process.returncode is None:
            try:
                logger.info(f"Terminating the server at port {port}...")
                process.terminate()
                await asyncio.wait_for(process.wait(), timeout=3.0)
                logger.info("Successfully terminated by SIGTERM")
                return ResponseModel("server process terminated (SIGTERM)")
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                logger.info("Successfully killed the server by SIGKILL")
                return ResponseModel("server process killed (SIGKILL)")
            except Exception as e:
                logger.error(f"Error killing the server process: {e}")
                return HTTPException(500, f"could not kill the server process: {e}")
        ACTIVE_SESSIONS.pop(x_user_id, None)
    else:
        logger.error("Could not find the server process")
        return HTTPException(500, "could not find the server process")
    
async def send_prompt(x_user_id: str, prompt: str):
    session = ACTIVE_SESSIONS.get(x_user_id)
    if session:
        port = session["port"]
        session["last_active"] = time.time()
        url = f"http://127.0.0.1:{port}/completion"
        payload = {
            "prompt": prompt # enter the prompt here
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=60.0)
                if response.status_code != 200:
                    raise HTTPException(500, "Couldn't fetch response from the inference server")
                result = response.json()
                return result.get("content", "") # TODO: get the actual key when we get the response from llama inference server
            except httpx.RequestError:
                raise HTTPException(502, "inference server is unreachable")
