import requests
import json

BASE_URL = "http://127.0.0.1:5000"

print("Testing SQLite Integration...")
print("=" * 50)

print("\n1. Registering user...")
resp = requests.post(f"{BASE_URL}/api/register", json={
    "username": "testuser",
    "email": "test@test.com",
    "password": "password123"
})
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n2. Logging in...")
resp = requests.post(f"{BASE_URL}/api/login", json={
    "email": "test@test.com",
    "password": "password123"
})
print(f"Status: {resp.status_code}")
data = resp.json()
print(f"Response: {data}")
token = data.get("token")

print("\n3. Getting portfolio...")
resp = requests.get(f"{BASE_URL}/api/portfolio", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n4. Getting transactions...")
resp = requests.get(f"{BASE_URL}/api/transactions", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n5. Getting analytics...")
resp = requests.get(f"{BASE_URL}/api/portfolio/analytics", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n6. Buying stock...")
resp = requests.post(f"{BASE_URL}/api/buy", headers={"Authorization": f"Bearer {token}"}, json={
    "symbol": "ZOMATO",
    "qty": 10
})
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n7. Buying another stock...")
resp = requests.post(f"{BASE_URL}/api/buy", headers={"Authorization": f"Bearer {token}"}, json={
    "symbol": "INFY",
    "qty": 5
})
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n8. Getting updated portfolio...")
resp = requests.get(f"{BASE_URL}/api/portfolio", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {resp.status_code}")
portfolio = resp.json()
print(f"Holdings: {json.dumps(portfolio['holdings'], indent=2)}")
print(f"Wallet: {portfolio['wallet']}")

print("\n9. Checking transactions in DB...")
resp = requests.get(f"{BASE_URL}/api/transactions", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {resp.status_code}")
print(f"Transactions: {resp.json()}")

print("\n" + "=" * 50)
print("SQLite Integration Test COMPLETE!")
print("=" * 50)