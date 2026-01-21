# SecureGuard AI – Next-Gen Cybersecurity SaaS 🛡️

SecureGuard AI is a high-performance, premium-grade SaaS platform designed to protect organizations from modern cyber threats. It features **real-time phishing defense**, a **unified security scanner**, a **RAG-powered AI Security Assistant**, and **interactive awareness training**.

![Main Interface](screenshots/home.png)

---

## 🚀 Quick Start (Step-by-Step)

The fastest way to get SecureGuard running is using Docker. This starts the Frontend, Backend, and PostgreSQL database with a single command.

![Docker Build Successful](screenshots/docker%20build%20succesfull.png)

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

### 2. Setup Guide
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/NoorAhmed786/SecureGuard.git
    cd SecureGuard
    ```

2.  **Configure Environment**
    Copy the example environment file and customize it if needed (optional for local testing).
    ```bash
    cp .env.example .env
    ```

3.  **Launch the Application**
    ```bash
    docker-compose up --build
    ```

### 3. Access the Services
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📸 Platform Showcase

### 🛡️ Dashboard & Security Scanner
A premium dashboard providing real-time metrics and a unified engine to analyze suspicious emails and websites.
![Dashboard](screenshots/dashboard.png)
![Scanner](screenshots/scanner.png)

### 🤖 AI Security Assistant (RAG)
An intelligent security companion that answers technical questions and analyzes threats using a proprietary knowledge base.
![AI Assistant](screenshots/rag.png)

### 🚨 Real-time Alerts
Instant threat notifications ensure you never miss a critical security event.
![Alerts](screenshots/alerts.png)

### 👑 Admin Panel
A comprehensive administrative panel for managing users, API keys, and system settings.
![Admin Dashboard](screenshots/admin.png)
![Admin Alerts](screenshots/admin-alert.png)

---

## 🏗️ Architecture & Security

### High-Level Design
SecureGuard follows a **Layered Clean Architecture** to ensure scalability and security.

For a detailed breakdown of data flows and trust boundaries, see the [Data Flow Diagram (DFD)](threat_model/data_flow_diagram.md).

```mermaid
graph TD
    User(("User")) -->|HTTPS| Frontend["Next.js Frontend"]
    Frontend -->|REST / WS| Backend["FastAPI Backend"]
    Backend --> DB[("PostgreSQL Database")]
    Backend --> Vector[("RAG Vector Store")]
    Backend --> External["Stripe / OpenAI"]
    
    %% Widget Flow
    ClientSite["Client Website"] -->|Widget API| Backend
    
    %% Simulation Flow
    Backend -->|SMTP| Email["Email Service"]
    Email -->|Phishing Sim| User

    %% Styles for visibility
    style User fill:#e1bee7,stroke:#4a148c,stroke-width:2px,color:#000
    style ClientSite fill:#ffcc80,stroke:#e65100,stroke-dasharray: 5 5,color:#000
    style External fill:#ffcc80,stroke:#e65100,stroke-dasharray: 5 5,color:#000
    style Email fill:#ffcc80,stroke:#e65100,stroke-dasharray: 5 5,color:#000
```

### 🛡️ Security & Code Quality
The project is continuously monitored by **SonarCloud** for vulnerabilities and code smells.

[![SonarCloud Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=NoorAhmed786_SecureGuard&metric=alert_status)](https://sonarcloud.io/dashboard?id=NoorAhmed786_SecureGuard)

- 📊 **[Live SonarCloud Report](https://sonarcloud.io/dashboard?id=NoorAhmed786_SecureGuard)**

    **Issues Before Resolution:**
    ![SonarCloud Issues Before](screenshots/sonarcube-issue-before-resolve.png)

- 🔒 **Zero-Secrets Policy**: Sensitive data is excluded via `.dockerignore` and `.gitignore`.
- 🔐 **Hardened Dockerfiles**: Optimized for security and minimal attack surface.
- 📦 **Automated Dependency Scanning**: Dependencies are vetted for vulnerabilities using OWASP Dependency Check (HTML reports available in Actions artifacts).

    **Before Resolution:**
    ![Dependency Check Before](screenshots/dependency-check-before-isssue-resolve-1.png)

    **After Resolution:**
    ![Dependency Check After](screenshots/dependency-check-after-issue-resolve.png)

---

## 🛠️ Technical Details

### Tech Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16, React 19, TypeScript | Modern SPA with SSR |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy | High-performance async API |
| **Database** | PostgreSQL 15 | Persistent data storage |
| **AI/ML** | Scikit-learn, VectorStore | Phishing detection & RAG |

### 🧪 Testing
```bash
# Backend Tests
cd backend && python -m pytest tests/
# Frontend Linting
cd frontend && npm run lint
```

---

## ⚖️ Compliance & Audit
SecureGuard follows the **Microsoft SDL** and **STRIDE** methodology.
- **Threat Model**: [threat_model/secureguard_report.html](threat_model/secureguard_report.html)
- **Justification**: [threat_model/justification.md](threat_model/justification.md)

---

### 🛡️ Manual Security Verification

#### Dependency-Check (OWASP)

This project uses **OWASP Dependency-Check** to identify any known vulnerabilities in the dependencies used by the application. Here's how you can run the Dependency-Check tool to generate a report.

**Requirements:**
- Java 8 or higher must be installed on your machine.
- Download and install [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/).

**Steps to Run Dependency-Check:**
1. **Navigate to the project directory**:
    ```bash
    cd path/to/your/project
    ```

2. **Run the Dependency-Check**:
    ```bash
    dependency-check --project "SecureGuard" --scan D:\SecureGuard --out D:\SecureGuard\dependency-reports --format HTML --noupdate
    ```

3. After running the above command, a report will be generated at `D:\SecureGuard\dependency-reports` (or the directory you specified).

**Explanation of the Command:**
- `--project "SecureGuard"`: Defines the name of your project.
- `--scan D:\SecureGuard`: Specifies the directory to scan (your project directory in this case).
- `--out D:\SecureGuard\dependency-reports`: Specifies where to save the generated report.
- `--format HTML`: Generates the report in HTML format.
- `--noupdate`: Skips the NVD database update process (useful if you're facing issues with the update).

#### CI/CD Security Configuration

To ensure a secure and reliable automated dependency check, the GitHub Actions workflow was configured with the following security measures:

1.  **Official Action Standardization**: Replaced legacy manual download scripts with the official **[OWASP Dependency-Check Action](https://github.com/dependency-check/Dependency-Check_Action)**. This ensures access to the latest features and vulnerability definitions.
2.  **Supply Chain Hardening**: The action is pinned to a specific immutable commit SHA (`1e54355...`) instead of a mutable tag like `@main`. This prevents potential supply chain attacks where a malicious actor could overwrite a tag to inject harmful code into the CI/CD pipeline.

---

Licensed under the **MIT License**.
*Built for Security. Designed for Excellence.* 🛡️
