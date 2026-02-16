import os

def download_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models", "BitNet-b1.58-2B-4T")
    
    command = [
        "hf",
        "download",
        "microsoft/BitNet-b1.58-2B-4T-gguf",
        "--local-dir",
        models_dir,
        "--include",
        "ggml-model-i2_s.gguf"
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