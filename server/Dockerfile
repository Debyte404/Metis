# Use Python slim image
FROM python:3.11-slim

RUN apt-get update && apt-get install -y git cmake clang build-essential libgomp1 curl wget python3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY requirements_gemini.txt .
RUN pip install --no-cache-dir -r requirements_gemini.txt






# Start the server (workdir is /app/BitNet now, change back to /app)
WORKDIR /app
COPY . .

# Expose port
EXPOSE 8000


# Start the server
CMD ["python", "server.py"]