from abc import ABC, abstractmethod
from typing import List
from app.domain.entities.rag import KnowledgeBaseDocument

class IVectorStore(ABC):
    """
    Interface for Vector Database (FAISS, PGVector, Pinecone).
    """
    @abstractmethod
    async def add_documents(self, documents: List[KnowledgeBaseDocument]):
        pass

    @abstractmethod
    async def search(self, query_text: str, top_k: int = 3) -> List[KnowledgeBaseDocument]:
        pass

class ILLMProvider(ABC):
    """
    Interface for Large Language Model Provider (OpenAI, Anthropic).
    """
    @abstractmethod
    async def generate_answer(self, query: str, context_docs: List[KnowledgeBaseDocument]) -> str:
        pass
