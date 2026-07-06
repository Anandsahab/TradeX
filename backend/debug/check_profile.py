import requests

BASE = 'http://127.0.0.1:5000/api'

# Login
r = requests.post(BASE + '/login', json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
if 'token' not in r.json():
    print("Login failed:", r.json())
    exit()

token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

print("=== PROFILE CHECK ===")
print(f"User: {r.json()['user']}")

# Transactions
r = requests.get(BASE + '/transactions', headers=headers)
txs = r.json()['transactions']
print(f"\nTransactions ({len(txs)}):")
for t in txs:
    print(f"  {t['type']} {t['symbol']} x{t['qty']} @ {t['price']}")

# Analytics
r = requests.get(BASE + '/portfolio/analytics', headers=headers)
an = r.json()
print(f"\nAnalytics:")
print(f"  Win Rate: {an.get('winRate')}%")
print(f"  Total Transactions: {an.get('totalTransactions')}")
print(f"  Portfolio Value: {an.get('portfolioValue')}")
print(f"  Total P/L: {an.get('totalPnl')}")