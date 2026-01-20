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
    get_websocket_manager,
    initialize_rag
)
from app.infrastructure.database.setup import get_db  # noqa: E402
from app.infrastructure.database.repositories import SQLAlchemyIncidentRepository  # noqa: E402

app = FastAPI(title="AI Phishing Detection SaaS", version="1.0.0")

# Ensure tables are created via scripts/seed.py or migrations
@app.on_event("startup")
async def startup():
    print("AI Phishing Detection SaaS Backend Started.")
    # Ensure tables are created in the database
    from app.infrastructure.database.setup import engine, Base
    async with engine.begin() as conn:
        print("🔗 Syncing database tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database sync complete.")
    
    # Initialize RAG Knowledge Base
    await initialize_rag()

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

# CORS Configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Default for local development
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    Improved RAG with conversational tone and greeting handling.
    """
    vector_store = get_vector_store()
    try:
        query = request.query.strip().lower()
        
        # 0. Safety Check
        sensitive_keywords = ["SECRET_KEY", "PASSWORD", "DATABASE_URL", "STRIPE_SECRET", "OPENAI_API_KEY", "JWT_SECRET"]
        if any(key.lower() in query for key in sensitive_keywords):
            return {
                "answer": "I'm sorry, I cannot provide sensitive system information or credentials. As a security assistant, my goal is to protect your data, not expose it.",
                "sources": ["Safety Filter"]
            }

        # 1. Greeting Detector
        greetings = ["hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon"]
        is_greeting = any(query.startswith(g) for g in greetings) or query in greetings
        
        greeting_response = ""
        if is_greeting:
            greeting_response = "Hi there! I'm your SecureGuard AI assistant. I'd be happy to help you with that! 😊\n\n"
            # If it's just a greeting, return early
            if query in greetings or (len(query.split()) <= 2 and is_greeting):
                return {
                    "answer": "Hi! I'm your SecureGuard AI assistant. How can I help you stay secure today? You can ask me about scanning emails, website security, or our protection widget!",
                    "sources": ["Greeting Engine"]
                }

        # 2. Retrieve most relevant context
        results = await vector_store.search(request.query, top_k=1)
        
        if not results:
            fallback = "I'm sorry, I don't have specific information on that in my current knowledge base. However, as a security assistant, I recommend being cautious with any unexpected links or requests for information."
            return {
                "answer": f"{greeting_response}{fallback}",
                "sources": []
            }
        
        context_doc = results[0]
        
        # 3. Conversational Synthesis
        import secrets
        
        lines = context_doc.content.split("\n")
        title = lines[0].replace("#", "").strip()
        body = "\n".join(lines[1:]).strip()
        
        # Varied, human-like phrasing
        intros = [
            f"Sure! I found some helpful details about **{title}**:",
            f"Here's what I know regarding **{title}**:",
            f"Based on our security documentation for **{title}**, here's an overview:",
            f"I've got you covered! Here's the info on **{title}**:"
        ]
        
        closings = [
            "\n\nDoes that clear things up for you? Let me know if you need any more help!",
            "\n\nI hope that helps! Is there anything else about SecureGuard you're curious about?",
            "\n\nFeel free to ask if you want more details on this or anything else security-related!",
            "\n\nStay secure! Let me know if you have any other questions."
        ]
        
        follow_ups = [
            "You might also want to check out our **Website Scanner** or **Email Analysis** features!",
            "By the way, have you tried our **Embeddable Protection Widget** yet?",
            "If you're interested in phishing, I can also tell you about **Typosquatting**!",
            "We also have a great section on **Security Best Practices** if you're interested."
        ]
        
        intro = secrets.choice(intros)
        closing = secrets.choice(closings)
        suggestion = f"\n\n*Pro Tip: {secrets.choice(follow_ups)}*"
        
        answer = f"{greeting_response}{intro}\n\n{body}{closing}{suggestion}"
        
        return {
            "answer": answer,
            "sources": [context_doc.metadata.get("source", "Internal KB")]
        }
    except Exception as e:
        print(f"RAG Error: {str(e)}")
        return {"answer": "I'm so sorry, I ran into a bit of trouble while looking that up for you. Could you try asking again? I'll do my best to get that info next time! Support is also available if this keeps happening.", "sources": []}

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
