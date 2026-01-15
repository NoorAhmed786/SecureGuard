# Deployment Guide

This document describes how to deploy SecureGuard AI.

## 🚀 Cloud Deployment (Vercel & Railway) - RECOMMENDED

For production, we recommend separating the frontend and backend for better scalability and performance.

### 1. Frontend (Vercel)
- **Repo**: Connect your GitHub repository.
- **Root Directory**: `frontend/`.
- **Framework Preset**: Next.js.
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://api.secureguard.com`).
  - `NEXT_PUBLIC_BASE_URL`: Your frontend URL (e.g., `https://secureguard.vercel.app`).

### 2. Backend (Railway.app)
- **Repo**: Connect your GitHub repository.
- **Root Directory**: `backend/`.
- **Database**: Add a PostgreSQL service.
- **Environment Variables**:
  - `SECRET_KEY`: Use a strong random hex string.
  - `ALLOWED_ORIGINS`: Your Vercel frontend URL.
  - `DATABASE_URL`: Automatically provided by Railway.
  - `JWT_SECRET`: Your signing secret.

---

## 🐋 Docker Compose (Self-Hosting)

The easiest way to self-host is using Docker Compose.

### Production Setup
1.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in production values:
    ```bash
    cp .env.example .env
    ```
    *Critical*: Set a strong `JWT_SECRET` and `SECRET_KEY`.

2.  **Build & Run**:
    ```bash
    docker-compose up --build -d
    ```

---

## 🔄 CI/CD Pipeline
Deployed automatically via GitHub Actions on every push to the `main` branch. SonarCloud analyzes code quality on every push.
