import pytest
from unittest.mock import AsyncMock, MagicMock
from app.application.use_cases.analyze_email import AnalyzeEmailUseCase
from app.domain.entities.phishing import PhishingIncident, ThreatLevel, IncidentStatus

@pytest.mark.asyncio
async def test_analyze_email_success():
    # Arrange
    mock_repo = AsyncMock()
    mock_analyzer = AsyncMock()
    
    # Mock analysis result
    mock_incident = PhishingIncident(
        id="test-id",
        user_id="user-1",
        sender_email="test@example.com",
        subject="Test",
        raw_email_content="Hello world",
        threat_level=ThreatLevel.LOW,
        confidence_score=0.1,
        status=IncidentStatus.SAFE
    )
    mock_analyzer.analyze.return_status = mock_incident
    mock_analyzer.analyze.return_value = mock_incident
    
    use_case = AnalyzeEmailUseCase(mock_repo, mock_analyzer)
    
    email_data = {
        "sender": "test@example.com",
        "subject": "Test",
        "body": "Hello world"
    }

    # Act
    result = await use_case.execute(email_data, user_id="user-1")

    # Assert
    assert result.sender_email == "test@example.com"
    assert result.status == IncidentStatus.SAFE
    mock_repo.save.assert_called_once()
    mock_analyzer.analyze.assert_called_once()
