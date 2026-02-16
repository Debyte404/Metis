import subprocess
import sys

def download_model():
    command = [
        "huggingface-cli",
        "download",
        "microsoft/BitNet-b1.58-2B-4T-gguf",
        "--local-dir",
        "models/BitNet-b1.58-2B-4T",
        "--include",
        "bitnet-b1_58-2b-q4_k_m.gguf"
    ]

    try:
        print(f"Executing: {' '.join(command)}")
        # check=True will raise an error if the command fails
        subprocess.run(command, check=True)
        print("\nModel downloaded successfully to models/BitNet-b1.58-2B-4T")
        
    except FileNotFoundError:
        print("\nError: 'huggingface-cli' not found.")
        print("Please install it running: pip install huggingface_hub[cli]")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"\nDownload failed with exit code {e.returncode}")
        sys.exit(e.returncode)

if __name__ == "__main__":
    download_model()