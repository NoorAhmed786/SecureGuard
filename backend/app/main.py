from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv
import os

# Load environment variables globally
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"), override=True)

# Debug prints (Remove in production)
print(f"DEBUG: STRIPE_PRICE_PRO='{os.getenv('STRIPE_PRICE_PRO')}'")
print(f"DEBUG: STRIPE_PRICE_ENTERPRISE='{os.getenv('STRIPE_PRICE_ENTERPRISE')}'")

from backend.app.domain.entities.phishing import PhishingIncident
from backend.app.application.use_cases.analyze_email import AnalyzeEmailUseCase
from backend.app.infrastructure.database.setup import get_db
from backend.app.infrastructure.database.repositories import SQLAlchemyIncidentRepository
from backend.app.infrastructure.threat_intel.google_safe_browsing import GoogleSafeBrowsingProvider
from backend.app.infrastructure.threat_intel.virus_total import VirusTotalProvider
from backend.app.domain.interfaces.detection import IPhishingAnalyzer
from backend.app.infrastructure.ai.classifier import classifier

# Thread Intel & AI Providers
threat_provider = GoogleSafeBrowsingProvider(api_key=os.getenv("GOOGLE_SAFE_BROWSING_KEY"))
from backend.app.infrastructure.ai.classifier import classifier

class TyposquattingDetector:
    def __init__(self, protected_domains: list[str]):
        self.protected_domains = protected_domains

    def check_url(self, url: str) -> dict:
        """Checks if a URL domain is a lookalike of protected domains."""
        try:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc.lower()
            if not domain:
                return {"is_typosquat": False}
            
            for protected in self.protected_domains:
                if domain == protected:
                    continue
                
                # Simple distance check (Levenshtein would be better, but this works for MVP)
                # Check if domains match after replacing common lookalikes
                normalized_domain = domain.replace('0', 'o').replace('1', 'i').replace('l', 'i')
                normalized_protected = protected.replace('0', 'o').replace('1', 'i').replace('l', 'i')
                
                if normalized_domain == normalized_protected:
                    return {"is_typosquat": True, "target": protected}
            
            return {"is_typosquat": False}
        except:
            return {"is_typosquat": False}

typo_detector = TyposquattingDetector(protected_domains=["google.com", "microsoft.com", "secureguard.ai"])

class AdvancedPhishingAnalyzer(IPhishingAnalyzer):
    def __init__(self, provider, typo_detector):
        self.provider = provider
        self.typo_detector = typo_detector
        self.classifier = classifier
        
    async def analyze(self, incident: PhishingIncident) -> PhishingIncident:
        score = 0.0
        report = {"checks": [], "log": []}
        
        # 1. AI/ML Content Analysis
        full_text = f"{incident.subject} {incident.raw_email_content}"
        ml_score = self.classifier.predict_score(full_text)
        
        score = ml_score
        report["log"].append(f"AI Classifier confidence: {ml_score:.2f}")
        
        # 2. Link Analysis (Safe Browsing + Typosquatting)
        high_threat_found = False
        for url in incident.urls_found:
             # Typosquat Check
             typo_res = self.typo_detector.check_url(url)
             if typo_res["is_typosquat"]:
                 high_threat_found = True
                 report["log"].append(f"Typosquatting detected: {url} looks like {typo_res['target']}")
             
             # Safe Browsing Check
             res = await self.provider.check_url(url)
             report["checks"].append(res)
             if not res["safe"]:
                 high_threat_found = True
                 report["log"].append(f"Malicious URL detected: {url}")
        
        if high_threat_found:
            score = max(score, 0.95)
        
        # Mark and return
        incident.mark_as_analyzed(score, report)
        return incident

analyzer = AdvancedPhishingAnalyzer(threat_provider, typo_detector)

# Infrastructure Adapters
from backend.app.infrastructure.payment.stripe_adapter import StripeAdapter
from backend.app.infrastructure.rag.simple_vector_store import SimpleVectorStore
from backend.app.infrastructure.rag.openai_provider import OpenAILLMProvider

payment_gateway = StripeAdapter(api_key=os.getenv("STRIPE_SECRET_KEY"))
vector_store = SimpleVectorStore()
llm_provider = OpenAILLMProvider(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="AI Phishing Detection SaaS", version="1.0.0")

# Ensure tables are created and seed admin
@app.on_event("startup")
async def startup():
    from backend.app.infrastructure.database.setup import engine, Base, get_db
    from backend.app.infrastructure.database.models import UserModel
    from backend.app.core.security import get_password_hash
    import uuid
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed Vector Store from Knowledge Base
    try:
        kb_path = os.path.join(os.path.dirname(__file__), "infrastructure/rag/knowledge_base.md")
        if os.path.exists(kb_path):
            with open(kb_path, "r") as f:
                content = f.read()
            
            # Split by ## headers
            sections = content.split("##")
            docs = []
            from backend.app.domain.entities.rag import KnowledgeBaseDocument
            import uuid
            
            for section in sections:
                if section.strip():
                    docs.append(KnowledgeBaseDocument(
                        id=str(uuid.uuid4()),
                        content=section.strip(),
                        metadata={"source": "knowledge_base.md"}
                    ))
            
            await vector_store.add_documents(docs)
            print(f"Sucessfully indexed {len(docs)} knowledge base sections.")
    except Exception as e:
        print(f"RAG Indexing Error: {str(e)}")
    
    # Seed Admin User
    async for db in get_db():
        from sqlalchemy import select
        result = await db.execute(select(UserModel).where(UserModel.email == "admin@secureguard.ai"))
        admin = result.scalars().first()
        
        if not admin:
            print("Seeding default admin user...")
            admin_user = UserModel(
                id=str(uuid.uuid4()),
                email="admin@secureguard.ai",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
            await db.commit()
        break

# Include Routers
from backend.app.application.routers import auth, dashboard, payment, simulation, scanner, website_scanner, api_keys, widget_api
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(payment.router)
app.include_router(simulation.router)
app.include_router(scanner.router)
app.include_router(website_scanner.router)
app.include_router(api_keys.router)
app.include_router(widget_api.router)

from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Just keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    sender: str
    subject: str
    body: str

class AskRequest(BaseModel):
    user_id: str
    query: str

class SubscribeRequest(BaseModel):
    user_id: str
    plan_id: str
    payment_method_id: str

@app.post("/api/v1/scan", response_model=Dict[str, Any])
async def scan_email(request: ScanRequest, db=Depends(get_db)):
    repo = SQLAlchemyIncidentRepository(db)
    use_case = AnalyzeEmailUseCase(repo, analyzer)
    
    # Mock user ID for now
    result = await use_case.execute(request.dict(), user_id="demo-user-123")
    
    return {
        "id": result.id,
        "status": result.status,
        "threat_level": result.threat_level,
        "score": result.confidence_score
    }

@app.post("/api/v1/rag/ask")
async def ask_agent(request: AskRequest):
    """
    Improved RAG using the SimpleVectorStore.
    Retrieves the most relevant section and formats it into a natural response.
    """
    try:
        # 1. Retrieve most relevant context
        results = await vector_store.search(request.query, top_k=1)
        
        if not results:
            return {
                "answer": "I'm sorry, I don't have specific information on that in my current knowledge base. However, as a security assistant, I recommend being cautious with any unexpected links or requests for information.",
                "sources": []
            }
        
        context_doc = results[0]
        
        # 2. Simulate LLM Synthesis (Template-based for local development)
        # In a real app, this would be: await llm_provider.generate_answer(request.query, [context_doc])
        
        # Extract title (first line) and body
        lines = context_doc.content.split("\n")
        title = lines[0].replace("#", "").strip()
        body = "\n".join(lines[1:]).strip()
        
        # Format the response naturally
        answer = f"According to SecureGuard's documentation on **{title}**:\n\n{body}\n\nIs there anything else security-related you'd like to know?"
        
        return {
            "answer": answer,
            "sources": [context_doc.metadata.get("source", "Internal KB")]
        }
    except Exception as e:
        print(f"RAG Error: {str(e)}")
        return {"answer": f"I encountered an error while searching for an answer: {str(e)}", "sources": []}

@app.post("/api/v1/payment/subscribe")
async def subscribe(request: SubscribeRequest):
    # Quick inline Use Case
    sub = await payment_gateway.create_subscription(
        request.user_id, request.plan_id, request.payment_method_id
    )
    return {"subscription_id": sub.id, "status": sub.status}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
