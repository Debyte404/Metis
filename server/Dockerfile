# Use Python slim image
FROM python:3.11-slim

RUN apt-get update && apt-get install -y git cmake clang build-essential libgomp1 curl wget python3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt



# Clone and Install llama.cpp (stable replacement for BitNet build)
RUN git clone --depth 1 --recursive https://github.com/ggerganov/llama.cpp /app/BitNet


WORKDIR /app/BitNet

# Build llama.cpp using cmake
RUN cmake -B build -DGGML_OPENMP=ON
RUN cmake --build build --config Release -j$(nproc)


ENV BUILD_DIR=/app/BitNet/build


# Start the server (workdir is /app/BitNet now, change back to /app)
WORKDIR /app
COPY . .

# Expose port
EXPOSE 8000


# Start the server
CMD ["python", "server.py"]
