import requests
try:
    r = requests.get("http://localhost:8000/health", timeout=5)
    print(f"Health check status: {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"Health check failed: {e}")
