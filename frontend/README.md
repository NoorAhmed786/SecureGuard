# SecureGuard AI – Enterprise Cybersecurity SaaS

## 🛡️ Overview
SecureGuard AI is a high-performance, premium-grade SaaS platform designed to protect organizations from modern cyber threats. It features **real-time phishing defense**, **automated website vulnerability scanning**, a **RAG-powered AI Security Assistant**, and an **interactive employee training module**.

The platform is built with a focus on **visual excellence**, **high-speed performance**, and **enterprise-scale architecture**.

---

## 🏛️ Design Architecture
The project follows a **Layered Clean Architecture** inspired by Hexagonal (Ports & Adapters) patterns and strictly adheres to **SOLID principles** for maximum maintainability and testability.

### Architecture Layers:
- **Application Layer**: Contains business use cases and REST API routers. It coordinates data flow without being tied to specific technologies.
- **Infrastructure Layer**: Handles all technical implementations—Database (SQLAlchemy), External APIs (Stripe), AI Providers (OpenAI/RAG), and Security Scanners.
- **Domain Layer**: Defines the core business entities and logic (Schemas/Models).

### SOLID Implementation:
- **S**RP: Distinct modules for Auth, Payments, Scanning, and AI.
- **O**CP: Pluggable provider system for Security Scanners and AI engines.
- **L**SP: Standardized interfaces for interchangeable infrastructure adapters.
- **I**SP: Specialized API routers ensuring clients only interact with relevant endpoints.
- **D**IP: High-level logic depends on abstractions, not low-level database details.

---

## ✨ Key Features
- **Professional Hero UI**: A perfectly balanced, no-scroll landing page with premium glass-morphism and motion graphics.
- **Smart Auth Gating**: Intelligent redirection logic that remembers user intent and sends them straight to their destination post-login.
- **Live Interactive Demo**: A sandbox environment for visitors to experience the AI Assistant and Scanner without an account.
- **Real-time Threat Stream**: Live visual indicators of blocks and mitigations within the platform.
- **Embeddable Protection**: A lightweight JavaScript widget to protect client websites at the edge.

---

## 🛠️ Tech Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy | High-performance async API & Business Logic |
| **Frontend** | Next.js 16, React, TypeScript | Modern SPA with Server-Side capabilities |
| **Animations** | Framer Motion | Fluid, high-end UI transitions |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Styling** | Vanilla CSS + Tailwind Utilities | Custom-designed premium glass-morphism |
| **AI/RAG** | OpenAI + SimpleVectorStore | Intelligent, context-aware security assistance |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js ≥ 20
- Python ≥ 3.11
- Stripe API Keys (for payments)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
# Configure your .env with STRIPE_SECRET_KEY, JWT_SECRET, etc.
uvicorn backend.app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📸 Final UI Reference
The home page features a professional, centered hero section with a dynamic background matching the authentication suite.

![SecureGuard UI](file:///C:/Users/FC/.gemini/antigravity/brain/7546a492-0574-40d4-b461-fa281449f305/home_page_1766180016525.png)

---

## ⚖️ License & Contribution
- **License**: MIT
- **Code Style**: Follow the established SOLID patterns. All backend code must include type hints. Frontend components should use Framer Motion for any interaction.

*Built for Security. Designed for Excellence.* 🛡️
