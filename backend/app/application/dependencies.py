"""
Dependency Injection Container

Centralizes the creation and configuration of application dependencies.
This follows the Dependency Inversion Principle and makes testing easier.
"""
import os
from app.domain.services.typosquatting import TyposquattingDetector
from app.domain.services.phishing_analyzer import AdvancedPhishingAnalyzer
from app.infrastructure.threat_intel.google_safe_browsing import GoogleSafeBrowsingProvider
from app.infrastructure.ai.classifier import classifier
from app.infrastructure.payment.stripe_adapter import StripeAdapter
from app.infrastructure.rag.simple_vector_store import SimpleVectorStore
from app.infrastructure.rag.openai_provider import OpenAILLMProvider
from app.infrastructure.websocket.connection_manager import ConnectionManager


# Singleton instances (created once and reused)
_typo_detector = None
_threat_provider = None
_analyzer = None
_payment_gateway = None
_vector_store = None
_llm_provider = None
_websocket_manager = None


def get_typo_detector() -> TyposquattingDetector:
    """
    Get or create the typosquatting detector instance.
    
    Returns:
        Configured TyposquattingDetector instance
    """
    global _typo_detector
    if _typo_detector is None:
        protected_domains = ["google.com", "microsoft.com", "secureguard.ai"]
        _typo_detector = TyposquattingDetector(protected_domains=protected_domains)
    return _typo_detector


def get_threat_provider() -> GoogleSafeBrowsingProvider:
    """
    Get or create the threat intelligence provider instance.
    
    Returns:
        Configured GoogleSafeBrowsingProvider instance
    """
    global _threat_provider
    if _threat_provider is None:
        api_key = os.getenv("GOOGLE_SAFE_BROWSING_KEY")
        _threat_provider = GoogleSafeBrowsingProvider(api_key=api_key)
    return _threat_provider


def get_analyzer() -> AdvancedPhishingAnalyzer:
    """
    Get or create the phishing analyzer instance.
    
    Returns:
        Configured AdvancedPhishingAnalyzer instance
    """
    global _analyzer
    if _analyzer is None:
        _analyzer = AdvancedPhishingAnalyzer(
            threat_provider=get_threat_provider(),
            typo_detector=get_typo_detector(),
            classifier=classifier
        )
    return _analyzer


def get_payment_gateway() -> StripeAdapter:
    """
    Get or create the payment gateway instance.
    
    Returns:
        Configured StripeAdapter instance
    """
    global _payment_gateway
    if _payment_gateway is None:
        api_key = os.getenv("STRIPE_SECRET_KEY")
        _payment_gateway = StripeAdapter(api_key=api_key)
    return _payment_gateway


def get_vector_store() -> SimpleVectorStore:
    """
    Get or create the vector store instance.
    
    Returns:
        SimpleVectorStore instance
    """
    global _vector_store
    if _vector_store is None:
        _vector_store = SimpleVectorStore()
    return _vector_store


def get_llm_provider() -> OpenAILLMProvider:
    """
    Get or create the LLM provider instance.
    
    Returns:
        Configured OpenAILLMProvider instance
    """
    global _llm_provider
    if _llm_provider is None:
        api_key = os.getenv("OPENAI_API_KEY")
        _llm_provider = OpenAILLMProvider(api_key=api_key)
    return _llm_provider


def get_websocket_manager() -> ConnectionManager:
    """
    Get or create the WebSocket connection manager instance.
    
    Returns:
        ConnectionManager instance
    """
    global _websocket_manager
    if _websocket_manager is None:
        _websocket_manager = ConnectionManager()
    return _websocket_manager
