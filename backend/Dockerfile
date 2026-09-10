# Production Dockerfile for RealNetra ViT Deepfake Detection Backend
FROM python:3.10-slim-bookworm

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade build tools to prevent PEP 517 build subprocess failures
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirement files and install CPU-optimized PyTorch & Torchvision
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy model weights and backend application code
COPY model /app/model
COPY backend /app/backend

WORKDIR /app/backend

# Expose server port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD sh -c 'curl -f http://localhost:${PORT:-8000}/ || exit 1'

# Start persistent FastAPI Uvicorn server (evaluates $PORT dynamically if set by host)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
