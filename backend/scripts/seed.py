import asyncio
import os
import sys
import uuid
from sqlalchemy import select
from dotenv import load_dotenv

# Add parent directory to path to import app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"), override=True)

async def seed_database():
    print("Starting database seeding...")
    
    # Delayed imports to avoid top-level hangs
    from app.infrastructure.database.setup import engine, Base, get_db
    from app.infrastructure.database.models import UserModel
    from app.core.security import get_password_hash
    from app.application.dependencies import get_vector_store
    from app.domain.entities.rag import KnowledgeBaseDocument
    
    # 1. Create tables
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Seed Admin User
    print("Connecting to database for seeding...")
    async for db in get_db():
        print("Checking for existing admin user...")
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
            print("Admin user seeded.")
        else:
            print("Admin user already exists.")
        break

    # 3. Seed Vector Store from Knowledge Base
    print("Starting knowledge base indexing...")
    vector_store = get_vector_store()
    try:
        kb_path = os.path.join(os.path.dirname(__file__), "../app/infrastructure/rag/knowledge_base.md")
        print(f"Checking for knowledge base at: {kb_path}")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Split by ## headers
            sections = content.split("##")
            docs = []
            
            for section in sections:
                if section.strip():
                    docs.append(KnowledgeBaseDocument(
                        id=str(uuid.uuid4()),
                        content=section.strip(),
                        metadata={"source": "knowledge_base.md"}
                    ))
            
            print(f"Adding {len(docs)} documents to vector store...")
            await vector_store.add_documents(docs)
            print(f"Successfully indexed {len(docs)} knowledge base sections.")
        else:
            print("Knowledge base file not found.")
    except Exception as e:
        print(f"RAG Indexing Error: {str(e)}")

    print("Seeding complete!")
    # Close engine connections
    await engine.dispose()
    print("Engine disposed.")

if __name__ == "__main__":
    asyncio.run(seed_database())
