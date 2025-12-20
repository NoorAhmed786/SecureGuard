from datetime import datetime
from typing import List
from backend.app.domain.entities.rag import KnowledgeBaseDocument
from backend.app.domain.interfaces.rag import IVectorStore

class SimpleVectorStore(IVectorStore):
    """
    In-memory vector store for prototyping (Mocking FAISS for now).
    """
    def __init__(self):
        self.documents: List[KnowledgeBaseDocument] = []

    async def add_documents(self, documents: List[KnowledgeBaseDocument]):
        self.documents.extend(documents)
        print(f"Added {len(documents)} docs to vector store.")

    async def search(self, query_text: str, top_k: int = 3) -> List[KnowledgeBaseDocument]:
        import re
        
        def tokenize(text):
            # Strip punctuation and lowercase
            clean = re.sub(r'[^\w\s]', '', text.lower())
            return set(clean.split())

        query_words = tokenize(query_text)
        scored_docs = []
        
        for doc in self.documents:
            doc_words = tokenize(doc.content)
            intersection = query_words.intersection(doc_words)
            
            # Weighted score: matches / (log of doc length) to avoid favoring huge docs
            # But for our small KB, raw intersection + phrase bonus is fine
            score = len(intersection)
            
            # Phrase match bonus (exact substring)
            if query_text.lower() in doc.content.lower():
                score += 10
            
            # Key section header bonus (if query words match title)
            title = doc.content.split('\n')[0].lower()
            if any(word in title for word in query_words):
                score += 5

            if score > 0:
                scored_docs.append((score, doc))
        
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k]]
