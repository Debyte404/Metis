# Use Python slim image
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git cmake clang build-essential libgomp1 curl && rm -rf /var/lib/apt/lists/*

RUN git clone --recursive https://github.com/microsoft/BitNet.git /app/BitNet

WORKDIR /app/BitNet

RUN bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)" && rm -rf /var/lib/apt/lists/* && apt-get clean

RUN cmake -B build -DGGML_OPENMP=ON
RUN cmake --build build --config Release -j$(nproc)

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

ENV BUILD_DIR=/app/BitNet/build

# Expose port
EXPOSE 8000

# Start the server
CMD ["python", "server.py"]
