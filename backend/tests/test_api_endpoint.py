import requests

print("Testing /api/stocks endpoint...")
try:
    resp = requests.get("http://localhost:5000/api/stocks", timeout=30)
    data = resp.json()
    print(f"Status: {resp.status_code}")
    stocks = data.get("stocks", [])
    print(f"Stocks returned: {len(stocks)}")
    for s in stocks[:3]:
        print(f"  {s.get('symbol')}: Rs.{s.get('price')}")
    print("\nSUCCESS!")
except Exception as e:
    print(f"ERROR: {e}")