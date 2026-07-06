import requests
import json

BASE = "http://127.0.0.1:5000/api"

print("=== 1. Register User ===")
resp = requests.post(f"{BASE}/register", json={
    "username": "trader2",
    "email": "trader2@test.com", 
    "password": "test123456"
})
print(resp.json())

print("\n=== 2. Login ===")
resp = requests.post(f"{BASE}/login", json={
    "email": "trader2@test.com",
    "password": "test123456"
})
data = resp.json()
token = data.get("token")
print(f"Token: {token[:50]}...")

headers = {"Authorization": f"Bearer {token}"}

print("\n=== 3. Get Initial Portfolio ===")
resp = requests.get(f"{BASE}/portfolio", headers=headers)
data = resp.json()
print(f"Wallet: {data.get('wallet')}")
print(f"Holdings: {[(h['symbol'], h['qty']) for h in data.get('holdings', [])]}")

print("\n=== 4. Buy Stock (ICICI x 5) ===")
resp = requests.post(f"{BASE}/buy", json={"symbol": "ICICI", "qty": 5}, headers=headers)
print(resp.json())

print("\n=== 5. Check Portfolio After Buy ===")
resp = requests.get(f"{BASE}/portfolio", headers=headers)
data = resp.json()
print(f"Wallet: {data.get('wallet')}")
print(f"Holdings: {[(h['symbol'], h['qty']) for h in data.get('holdings', [])]}")

print("\n=== 6. Check Transactions ===")
resp = requests.get(f"{BASE}/transactions", headers=headers)
data = resp.json()
print(f"Transactions: {data.get('transactions', [])}")

print("\n=== 7. Sell Stock (RELIANCE x 2) ===")
resp = requests.post(f"{BASE}/sell", json={"symbol": "RELIANCE", "qty": 2}, headers=headers)
print(resp.json())

print("\n=== 8. Check Portfolio After Sell ===")
resp = requests.get(f"{BASE}/portfolio", headers=headers)
data = resp.json()
print(f"Wallet: {data.get('wallet')}")
print(f"Holdings: {[(h['symbol'], h['qty']) for h in data.get('holdings', [])]}")

print("\n=== 9. All Transactions ===")
resp = requests.get(f"{BASE}/transactions", headers=headers)
data = resp.json()
for t in data.get('transactions', []):
    print(f"  {t['type']} {t['symbol']} x{t['qty']} @ {t['price']} = {t['total']}")

print("\n=== TRADING TEST COMPLETE ===")