# Deployment Guide

## Prerequisites
-   Docker & Docker Compose
-   Git

## Production Setup
1.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in production values:
    ```bash
    cp .env.example .env
    ```
    *Critical*: Set a strong `JWT_SECRET` and `POSTGRES_PASSWORD`.

2.  **Build & Run**:
    ```bash
    docker-compose -f docker-compose.yml up --build -d
    ```

## CI/CD Pipeline
Deployed via GitHub Actions.
-   **Main Branch**: Triggers production build and push to GHCR.
-   **SonarCloud**: Automatically analyzes code quality on every push.
