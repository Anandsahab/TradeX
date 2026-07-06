import requests

BASE = 'http://127.0.0.1:5000/api'
r = requests.post(BASE + '/login', json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

r = requests.get(BASE + '/transactions', headers=headers)
txs = r.json()['transactions']

print("Transactions:")
for t in txs:
    print(f"  {t['type']} {t['symbol']} x{t['qty']} @ {t['price']}")

# Buy more RELIANCE at higher price to create potential win
r = requests.get(BASE + '/stocks/live', timeout=10)
prices = r.json()['prices']
rel_price = prices['RELIANCE']['price']
print(f"\nRELIANCE live: {rel_price}")

# Buy at current price
r = requests.post(BASE + '/buy', json={'symbol': 'RELIANCE', 'qty': 2}, headers=headers)
print(f"Buy: {r.json().get('success')}")

# Sell at slightly higher (by simulating price difference)
# In real this would need market movement, but logic is correct