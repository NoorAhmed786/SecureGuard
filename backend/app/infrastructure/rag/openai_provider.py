from typing import List
from app.domain.entities.rag import KnowledgeBaseDocument
from app.domain.interfaces.rag import ILLMProvider

class OpenAILLMProvider(ILLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_answer(self, query: str, context_docs: List[KnowledgeBaseDocument]) -> str:
        # Mocking OpenAI call
        context_text = "\n".join([d.content for d in context_docs])
        return f"Based on the documents: {context_text[:50]}... I can answer: {query} (AI Response)"
