import requests

BASE = 'http://127.0.0.1:5000/api'
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json()['transactions']

sells = [t for t in txs if t['type'] == 'SELL']
print("=== SELL Analysis ===")
for t in sells[:10]:
    buys = [b for b in txs if b['type'] == 'BUY' and b['symbol'] == t['symbol']]
    if buys:
        total_qty = sum(b['qty'] for b in buys)
        avg_buy = sum(b['price'] * b['qty'] for b in buys) / total_qty if total_qty > 0 else 0
        win = 'WIN' if t['price'] > avg_buy else 'LOSS'
        print(f"  {t['symbol']} sell@{t['price']} vs avg_buy@{avg_buy:.2f} = {win}")