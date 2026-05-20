# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Cloud Run uses PORT env variable, defaults to 8080)
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the application (use $PORT from Cloud Run, default to 8080)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
