# API Reference

*Note: Full interactive documentation is available at `/docs` (Swagger UI) when running the backend.*

## Core Endpoints

### Scanning
-   `POST /api/v1/scan`: Analyze an email or URL for phishing.
-   `WS /ws/alerts`: Real-time threat notifications.

### Authentication
-   `POST /api/v1/auth/login`: Obtain a JWT token.
-   `POST /api/v1/auth/register`: Create a new user account.

### RAG Agent
-   `POST /api/v1/rag/ask`: Query the AI security assistant.
