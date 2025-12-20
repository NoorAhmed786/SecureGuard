import httpx
import asyncio
import json

async def test_scanner():
    url = "http://localhost:8000/api/v1/scanner/scan"
    
    test_domains = ["google.com", "example.com", "micros0ft.com"]
    
    async with httpx.AsyncClient(timeout=30) as client:
        for domain in test_domains:
            print(f"\nScanning: {domain}...")
            try:
                response = await client.post(url, json={"url": domain})
                if response.status_code == 200:
                    result = response.json()
                    print(f"Domain: {result['domain']}")
                    print(f"Score: {result['score']}")
                    print("Findings:")
                    for f in result['findings']:
                        print(f"  - {f['title']}: {f['status']} ({f['detail']})")
                else:
                    print(f"Error ({response.status_code}): {response.text}")
            except Exception as e:
                print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_scanner())
