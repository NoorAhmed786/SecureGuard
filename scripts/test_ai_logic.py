import requests
import json

def test_ai():
    url = "http://localhost:8000/api/v1/scan"
    
    samples = [
        {
            "sender": "attacker@scam.com",
            "subject": "Urgent: Your account is suspended",
            "body": "Please login at http://fake-login.com to verify your identify and avoid account deletion."
        },
        {
            "sender": "alert@micros0ft.com",
            "subject": "Security Alert: Lookalike Domain Detected",
            "body": "Warning! We detected an attempt to access your account from http://micros0ft.com. This is a lookalike domain."
        },
        {
            "sender": "friend@gmail.com",
            "subject": "Lunch tomorrow?",
            "body": "Hey, do you want to grab lunch at that new place around 12:30?"
        }
    ]
    
    for sample in samples:
        print(f"\nTesting: {sample['subject']}")
        try:
            response = requests.post(url, json=sample)
            if response.status_code == 200:
                result = response.json()
                print(f"Detected Status: {result['status']}")
                print(f"Threat Level: {result['threat_level']}")
                print(f"AI Score: {result['score']}")
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Failed to connect: {e}")

if __name__ == "__main__":
    test_ai()
