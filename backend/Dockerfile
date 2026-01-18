# Build stage
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final stage
FROM python:3.11-slim AS runner

WORKDIR /app

# Install runtime dependencies (like libpq for postgres)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# SECURITY: Copy application code
# Protected by .dockerignore which excludes sensitive files (.env, .git, logs, database)
COPY . .

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Security: Run as non-root user
RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
