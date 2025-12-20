import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

class PhishingClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.model = LogisticRegression()
        self.is_trained = False
        
        # In a real app, we would load a pre-trained model
        # For this MVP, we will "self-train" on a few samples at startup
        self._mock_training()

    def _mock_training(self):
        """Prepare a very basic internal model for demonstration."""
        data = [
            ("Your account has been suspended. Click here to verify.", 1),
            ("Urgent: Payment failed for your subscription.", 1),
            ("New login detected from an unknown device.", 1),
            ("Verify your password now to avoid account deletion.", 1),
            ("Hey, are we still meeting for lunch today?", 0),
            ("The project report is attached for your review.", 0),
            ("Meeting invitation: Sprint Planning tomorrow.", 0),
            ("Welcome to SecureGuard! Your account is ready.", 0),
        ]
        texts = [d[0] for d in data]
        labels = [d[1] for d in data]
        
        X = self.vectorizer.fit_transform(texts)
        self.model.fit(X, labels)
        self.is_trained = True

    def predict_score(self, text: str) -> float:
        """Predict the probability of a text being phishing (0.0 to 1.0)."""
        if not self.is_trained:
            return 0.5
        
        X = self.vectorizer.transform([text])
        probabilities = self.model.predict_proba(X)
        # Probability of class '1' (phishing)
        return float(probabilities[0][1])

# Global instance
classifier = PhishingClassifier()
