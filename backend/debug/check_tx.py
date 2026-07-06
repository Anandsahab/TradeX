import requests

BASE = 'http://127.0.0.1:5000/api'
r = requests.post(BASE + '/login', json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

r = requests.get(BASE + '/transactions', headers=headers)
txs = r.json()['transactions']

print("SBIN Transactions:")
for t in txs:
    print(f"  {t['type']} x{t['qty']} @ {t['price']}")

# Calculate manually
buys = [t for t in txs if t['type'] == 'BUY' and t['symbol'] == 'SBIN']
sells = [t for t in txs if t['type'] == 'SELL' and t['symbol'] == 'SBIN']
print(f"\nBUYS: {len(buys)}, SELLS: {len(sells)}")

if buys and sells:
    avg_buy = sum(b['price'] * b['qty'] for b in buys) / sum(b['qty'] for b in buys)
    print(f"Average BUY price: {avg_buy:.2f}")
    for s in sells:
        win = "WIN" if s['price'] > avg_buy else "LOSS"
        print(f"  SELL @{s['price']} vs avg @{avg_buy:.2f} = {win}")