from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class KnowledgeBaseDocument(BaseModel):
    id: str
    content: str
    metadata: Dict[str, str] = {} # source, title, url
    embedding_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserQuery(BaseModel):
    id: str
    user_id: str
    query_text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentResponse(BaseModel):
    id: str
    query_id: str
    answer_text: str
    sources: List[str] = [] # List of Document IDs or Titles
    confidence_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
