from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv
import os

# Load environment variables globally
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"), override=True)

from app.core.logging import setup_logging  # noqa: E402
setup_logging()

from app.application.use_cases.analyze_email import AnalyzeEmailUseCase  # noqa: E402
from app.application.dependencies import (  # noqa: E402
    get_analyzer,
    get_payment_gateway,
    get_vector_store,
    get_websocket_manager
)
from app.infrastructure.database.setup import get_db  # noqa: E402
from app.infrastructure.database.repositories import SQLAlchemyIncidentRepository  # noqa: E402

app = FastAPI(title="AI Phishing Detection SaaS", version="1.0.0")

# Ensure tables are created via scripts/seed.py or migrations
@app.on_event("startup")
async def startup():
    print("AI Phishing Detection SaaS Backend Started.")
    # Tables and seeding are now handled by scripts/seed.py
    pass

# Include Routers
from app.application.routers import auth, dashboard, payment, simulation, scanner, website_scanner, api_keys, widget_api, admin  # noqa: E402
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(payment.router)
app.include_router(simulation.router)
app.include_router(scanner.router)
app.include_router(website_scanner.router)
app.include_router(api_keys.router)
app.include_router(widget_api.router)
app.include_router(admin.router)

from fastapi import WebSocket, WebSocketDisconnect  # noqa: E402

# WebSocket endpoint for real-time alerts
@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    manager = get_websocket_manager()
    await manager.connect(websocket)
    print(f"WebSocket client connected: {websocket.client}")
    try:
        while True:
            await websocket.receive_text()  # Just keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("WebSocket client disconnected")
    except Exception as e:
        manager.disconnect(websocket)
        print(f"WebSocket error: {e}")

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
