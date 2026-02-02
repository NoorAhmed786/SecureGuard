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
SecureGuard follows a **Layered Clean Architecture** (Domain-Driven Design principles) to ensure the system is independent, testable, and robust.

#### Why Clean Architecture?
- **Independence of Frameworks**: core logic (like phishing detection rules) isn't tied to FastAPI or React.
- **Enhanced Security**: Separation of layers prevents sensitive domain logic from leaking into infrastructure or UI layers.
- **Fast Testability**: The "Domain" layer can be tested without databases or external APIs.
- **Future-Proof Scalability**: You can swap databases or AI models in the infrastructure layer without breaking the core application.

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
    ![Dependency Check Before](screenshots/dependency-check-before-isssue-resolve-2.png)
    ![Dependency Check Before](screenshots/dependency-check-before-isssue-resolve-3.png)

    **After Resolution:**
    ![Dependency Check After](screenshots/dependency-check-after-issue-resolve.png)

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

#### SBOM Generation (CycloneDX)

This project supports **Software Bill of Materials (SBOM)** generation using CycloneDX to provide transparency into dependencies.

**Manual Generation:**

1. **Frontend (Node.js)**:
    ```bash
    cd frontend
    npx @cyclonedx/cyclonedx-npm --output-file bom.xml
    ```

2. **Backend (Python)**:
    ```bash
    cd backend
    pip install cyclonedx-bom
    cyclonedx-py requirements -i requirements.txt -o bom.xml
    ```

**Automated Workflow:**
The project includes a GitHub Actions workflow (`.github/workflows/owasp-dt-check.yml`) that automatically generates SBOMs and uploads them to OWASP Dependency Track for continuous vulnerability monitoring.

> **Note**: To use the automated workflow, configure `OWASP_DT_URL` and `OWASP_DT_KEY` in your repository secrets.

**What's in the SBOM?**

The generated SBOM files (`bom.xml` or `bom.json`) contain a complete inventory of:
- **All Dependencies**: Direct and transitive (dependencies of dependencies)
- **Version Information**: Exact versions of each package
- **Package URLs (PURLs)**: Standardized identifiers like `pkg:pypi/fastapi@0.127.0`
- **License Data**: License information for compliance
- **Vulnerability Identifiers**: CVE references for known security issues

**Analyzing Your SBOMs:**

You can analyze the generated SBOMs using various tools:

1. **Online Viewers**:
   - Upload to [CycloneDX Viewer](https://cyclonedx.github.io/cyclonedx-web-tool/)
   - Use [OWASP Dependency Track](https://dependencytrack.org/)

2. **CLI Tools**:
   ```bash
   # Using grype (vulnerability scanner)
   grype sbom:frontend/bom.xml
   
   # Using syft (SBOM analyzer)
   syft packages sbom:backend/bom.xml
   ```

3. **GitHub Security**:
   - Upload SBOMs to GitHub's Dependency Graph
   - Enable Dependabot alerts for automatic vulnerability notifications

---

#### Dependency-Track Integration

OWASP Dependency-Track provides continuous vulnerability monitoring and SBOM analysis for the software supply chain.

**Setup:**
```bash
docker-compose up -d
```
![Dependency-Track Docker](screenshots/dependency-track-docker%20%282%29.png)

- **UI:** http://localhost:8080 (default: `admin` / `admin`)
- **API:** http://localhost:8081

![Dependency-Track Login](screenshots/dependency-track-login.png)

**Workflow:**
1. Create projects: **Projects** → **+** (Frontend & Backend)

![Dependency-Track Dashboard](screenshots/dependency-track-dashboard.png)

2. Upload SBOMs: Open project → **Upload BOM** → select `sbom-frontend.json` or `sbom-backend.json`

![Dependency-Track Analyze](screenshots/dependency-track-anayze.png)

3. View findings: **Vulnerabilities**, **Components**, **Portfolio**

**Automated Upload (Optional):**
```bash
python upload_sbom.py
```

**Credentials:** Managed via `.env` file. See [Security & Database Credentials](#-security--database-credentials).

---

### 🔐 Security & Database Credentials

**Important:** All database credentials (SecureGuard and Dependency-Track) are now configured via environment variables in a `.env` file and **NOT hardcoded** in `docker-compose.yml`.

**For local testing:**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and change credentials as needed (optional for local dev, **required for production**)
3. Run `docker-compose up` — Docker will automatically load the `.env` file

**For production deployment:**
- Use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, GitHub Secrets)
- Never commit `.env` with real credentials to version control
- Ensure `.env` is in `.gitignore`
- Rotate passwords regularly

**Database Credentials in `.env`:**
```
# SecureGuard Database
POSTGRES_USER=secureuser
POSTGRES_PASSWORD=securepassword
POSTGRES_DB=secureguard_db

# Dependency-Track Database
ALPINE_DATABASE_URL=jdbc:postgresql://postgres:5432/dtrack
ALPINE_DATABASE_USERNAME=dtrack
ALPINE_DATABASE_PASSWORD=dtrack
```

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

## ⚖️ License
This project is developed for **Educational Use & Learning Purposes** only.  
All intellectual property and code logic are part of a personal academic portfolio.
