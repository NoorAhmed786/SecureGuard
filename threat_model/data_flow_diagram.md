# SecureGuard Data Flow Diagram (DFD)

This Data Flow Diagram (DFD) visualizes the flow of information within the SecureGuard system. It highlights the trust boundaries where security threats are most likely to occur.

```mermaid
graph TD
    %% Entities
    User((User / Browser))
    Admin((Admin))
    PaymentGW[External: Stripe]
    AI_Provider[External: OpenAI]
    SafeBrowsing[External: Google Safe Browsing]

    %% Processes
    subgraph "Trust Boundary: SecureGuard Cloud"
        Frontend[Frontend (Next.js)]
        Backend[Backend API (FastAPI)]
        
        subgraph "Internal Network / VPC"
            DB[(PostgreSQL Database)]
            VectorDB[(Vector Store)]
        end
    end

    %% Data Flows - User
    User -->|1. HTTPS: Login / Dashboard| Frontend
    User -->|2. HTTPS: Submit Scan Request| Frontend
    Frontend -->|3. REST/WSS: API Calls| Backend
    
    %% Data Flows - Admin
    Admin -->|4. HTTPS: Admin Actions| Frontend

    %% Data Flows - Backend Processing
    Backend -->|5. SQL: Read/Write User Data| DB
    Backend -->|6. Vector Search: RAG Context| VectorDB
    
    %% Data Flows - External
    Backend -->|7. TLS: Process Payment| PaymentGW
    Backend -->|8. TLS: LLM Inference| AI_Provider
    url_scanner[Internal Component: Scanner]
    Backend -.->|9. Invoke| url_scanner
    url_scanner -->|10. TLS: Verify URL| SafeBrowsing

    %% Data Flows - Widget
    ClientSite[External Website\n(Client Host)]
    ClientSite -->|11. Script Load & API Key| Backend
    Backend -->|12. JSON: Threat Status| ClientSite

    %% Data Flows - Simulation
    EmailProvider[External: Email Service/SMTP]
    Backend -->|13. SMTP: Send Phishing Sim| EmailProvider
    EmailProvider -->|14. Email| User

    %% Trust Boundaries Style
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Admin fill:#f9f,stroke:#333,stroke-width:2px
    style PaymentGW fill:#ddd,stroke:#333,stroke-dasharray: 5 5
    style AI_Provider fill:#ddd,stroke:#333,stroke-dasharray: 5 5
    style SafeBrowsing fill:#ddd,stroke:#333,stroke-dasharray: 5 5
```

## Key Trust Boundaries

1.  **Internet Boundary**: Between the User/Admin (Untrusted) and the Frontend/Backend (Trusted). Risks: *Spoofing, Tampering, DoS*.
2.  **Internal Network Boundary**: Between the Backend (Application Logic) and the Databases. Risks: *Information Disclosure (if compromised), Elevation of Privilege*.
3.  **External Service Boundary**: Between the Backend and External APIs (Stripe, OpenAI). Risks: *Tampering (MitM), Information Disclosure (Leaked Keys)*.
