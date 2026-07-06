import requests
import time

BASE = 'http://127.0.0.1:5000/api'

# Login
r = requests.post(BASE + '/login', json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

print("=== AUTO ORDER EXECUTION TEST ===")

# Check current price
r = requests.get(BASE + '/stocks/live', timeout=10)
prices = r.json()['prices']
current = prices.get('SBIN', {}).get('price', 1100)
print(f"Current SBIN price: {current}")

# Create order that should execute at current price (use current price as target)
r = requests.post(BASE + '/orders/place', json={
    'orderType': 'LIMIT',
    'side': 'BUY',
    'symbol': 'SBIN',
    'quantity': 1,
    'targetPrice': current  # Use current price - should trigger immediately
}, headers=headers)
print(f"Order placed: {r.json().get('success')}")

# Check pending orders
r = requests.get(BASE + '/orders/pending', headers=headers)
print(f"Pending before: {len(r.json().get('orders', []))}")

# Wait for scheduler
print("Waiting 7 seconds for scheduler...")
time.sleep(7)

# Check after
r = requests.get(BASE + '/orders/pending', headers=headers)
print(f"Pending after: {len(r.json().get('orders', []))}")

# Check wallet
r = requests.get(BASE + '/portfolio', headers=headers)
print(f"Wallet: {r.json().get('wallet')}")
print(f"Holdings: {r.json().get('holdings')}")

print("\n=== AUTO EXECUTION TEST COMPLETE ===")
print("If holdings show SBIN, order executed automatically!")