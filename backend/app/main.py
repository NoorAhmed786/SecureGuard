from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv
import os

# Load environment variables globally
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"), override=True)

from app.domain.entities.phishing import PhishingIncident
from app.application.use_cases.analyze_email import AnalyzeEmailUseCase
from app.application.dependencies import (
    get_analyzer,
    get_payment_gateway,
    get_vector_store,
    get_llm_provider,
    get_websocket_manager
)
from app.infrastructure.database.setup import get_db
from app.infrastructure.database.repositories import SQLAlchemyIncidentRepository

app = FastAPI(title="AI Phishing Detection SaaS", version="1.0.0")

# Ensure tables are created and seed admin
@app.on_event("startup")
async def startup():
    from app.infrastructure.database.setup import engine, Base, get_db
    from app.infrastructure.database.models import UserModel
    from app.core.security import get_password_hash
    import uuid
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed Vector Store from Knowledge Base
    vector_store = get_vector_store()
    try:
        kb_path = os.path.join(os.path.dirname(__file__), "infrastructure/rag/knowledge_base.md")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Split by ## headers
            sections = content.split("##")
            docs = []
            from app.domain.entities.rag import KnowledgeBaseDocument
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
from app.application.routers import auth, dashboard, payment, simulation, scanner, website_scanner, api_keys, widget_api
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(payment.router)
app.include_router(simulation.router)
app.include_router(scanner.router)
app.include_router(website_scanner.router)
app.include_router(api_keys.router)
app.include_router(widget_api.router)

from fastapi import WebSocket, WebSocketDisconnect

# WebSocket endpoint for real-time alerts
@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    manager = get_websocket_manager()
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Just keep alive
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
    analyzer = get_analyzer()
    manager = get_websocket_manager()
    use_case = AnalyzeEmailUseCase(repo, analyzer, manager=manager)
    
    # Mock user ID for now
    result = await use_case.execute(request.dict(), user_id="demo-user-123")
    
    return {
        "id": result.id,
        "status": result.status.value,
        "threat_level": result.threat_level.value,
        "score": result.confidence_score,
        "sender": result.sender_email,
        "subject": result.subject,
        "detected_at": result.detected_at.isoformat(),
        "report": result.analysis_report
    }

@app.post("/api/v1/rag/ask")
async def ask_agent(request: AskRequest):
    """
    Improved RAG using the SimpleVectorStore.
    Retrieves the most relevant section and formats it into a natural response.
    """
    vector_store = get_vector_store()
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
    payment_gateway = get_payment_gateway()
    sub = await payment_gateway.create_subscription(
        request.user_id, request.plan_id, request.payment_method_id
    )
    return {"subscription_id": sub.id, "status": sub.status}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
