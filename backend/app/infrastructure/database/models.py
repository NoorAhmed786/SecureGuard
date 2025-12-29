from sqlalchemy import Column, String, Float, DateTime, JSON, Enum as SQLEnum, Boolean, Integer
from app.infrastructure.database.setup import Base
from app.domain.entities.phishing import IncidentStatus, ThreatLevel
from datetime import datetime
import datetime as dt_module
import secrets

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    raw_email_content = Column(String, nullable=True)
    email_headers = Column(JSON, default={})
    sender_email = Column(String)
    subject = Column(String)
    urls_found = Column(JSON, default=[])
    attachments_metadata = Column(JSON, default=[])
    
    status = Column(SQLEnum(IncidentStatus), default=IncidentStatus.PENDING)
    threat_level = Column(SQLEnum(ThreatLevel), default=ThreatLevel.LOW)
    confidence_score = Column(Float, default=0.0)
    
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    analysis_report = Column(JSON, default={})

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    organization_id = Column(String, nullable=True)
    role = Column(String, default="user") # 'admin' or 'user'
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Stripe Integration
    stripe_customer_id = Column(String, nullable=True)
    subscription_status = Column(String, default="free") # 'free', 'active', 'canceled'

class APIKeyModel(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    key = Column(String, unique=True, index=True)
    name = Column(String)  # User-friendly name for the key
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0)

class WebsiteScanModel(Base):
    __tablename__ = "website_scans"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    url = Column(String)
    scan_results = Column(JSON, default={})  # Detailed scan results
    security_score = Column(Float, default=0.0)  # Overall score 0-100
    vulnerabilities_found = Column(Integer, default=0)
    scanned_at = Column(DateTime, default=datetime.utcnow)

class WidgetEventModel(Base):
    __tablename__ = "widget_events"
    
    id = Column(String, primary_key=True)
    api_key_id = Column(String, index=True)
    event_type = Column(String)  # 'url_check', 'threat_blocked', 'warning_shown'
    url_checked = Column(String)
    is_threat = Column(Boolean, default=False)
    threat_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    event_metadata = Column(JSON, default={})  # Additional event data
