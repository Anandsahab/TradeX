import requests

BASE = 'http://127.0.0.1:5000/api'

# Login
r = requests.post(BASE + '/login', json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
print("Login:", r.json().get('user', {}).get('username'))
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

# Check wallet
r = requests.get(BASE + '/portfolio', headers=headers)
print(f"Wallet: {r.json().get('wallet')}")

# Place LIMIT BUY order (buy when price drops to target)
print("\n[1] Place LIMIT BUY order")
r = requests.post(BASE + '/orders/place', json={
    'orderType': 'LIMIT',
    'side': 'BUY',
    'symbol': 'SBIN',
    'quantity': 2,
    'targetPrice': 1000  # Buy when price drops to 1000
}, headers=headers)
print(r.json())

# Get pending orders
print("\n[2] Pending Orders")
r = requests.get(BASE + '/orders/pending', headers=headers)
print(r.json())

# Check orders manually
print("\n[3] Check / Execute Orders")
r = requests.post(BASE + '/orders/check', headers=headers)
print(r.json())

# Get pending again
r = requests.get(BASE + '/orders/pending', headers=headers)
print("Orders after check:", r.json())

# Cancel order test
print("\n[4] Cancel Pending Order")
r = requests.post(BASE + '/orders/place', json={
    'orderType': 'LIMIT',
    'side': 'BUY',
    'symbol': 'ICICI',
    'quantity': 1,
    'targetPrice': 500
}, headers=headers)
order_id = r.json().get('order', {}).get('id')
print(f"Created order ID: {order_id}")

if order_id:
    r = requests.post(f"{BASE}/orders/cancel/{order_id}", headers=headers)
    print("Cancel result:", r.json())

print("\n=== ORDER TEST COMPLETE ===")