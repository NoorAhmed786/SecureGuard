from typing import List
from app.domain.entities.rag import KnowledgeBaseDocument
from app.domain.interfaces.rag import IVectorStore

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

        def get_synonyms(word):
            syns = {
                "scan": ["scanner", "check", "analyze", "detect"],
                "website": ["site", "domain", "url", "portal"],
                "email": ["mail", "message", "inbox"],
                "widget": ["script", "embed", "integration"],
                "phishing": ["scam", "fraud", "fake"],
                "secure": ["protect", "guard", "safe"],
                "dashboard": ["overview", "stats", "panel"]
            }
            return syns.get(word, [])

        query_words = tokenize(query_text)
        # Expand query with synonyms
        expanded_query = set(query_words)
        for word in query_words:
            expanded_query.update(get_synonyms(word))
            
        scored_docs = []
        
        for doc in self.documents:
            doc_words = tokenize(doc.content)
            intersection = expanded_query.intersection(doc_words)
            
            # Base score from word intersection
            score = len(intersection)
            
            # Phrase match bonus (exact substring) - high priority
            if query_text.lower() in doc.content.lower():
                score += 20
            
            # Header boost (CRITICAL: If query words match the main title, it's likely the right doc)
            title = doc.content.split('\n')[0].lower()
            title_words = tokenize(title)
            title_intersection = query_words.intersection(title_words)
            if title_intersection:
                score += (len(title_intersection) * 15)

            if score > 0:
                scored_docs.append((score, doc))
        
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k]]
