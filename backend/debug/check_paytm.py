import requests

BASE = 'http://127.0.0.1:5000/api'
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json()['transactions']

print("=== PAYTM Analysis ===")
paytm = [t for t in txs if t['symbol'] == 'PAYTM']
for t in paytm:
    print(f"  {t['type']} x{t['qty']} @ {t['price']}")

# Calculate manually
buys = [t for t in paytm if t['type'] == 'BUY']
sells = [t for t in paytm if t['type'] == 'SELL']

print(f"\nTotal BUYS: {len(buys)}")
print(f"Total SELLS: {len(sells)}")

if sells:
    for s in sells:
        if buys:
            avg_buy = sum(b['price'] * b['qty'] for b in buys) / sum(b['qty'] for b in buys)
            print(f"\nSELL @{s['price']} vs AVG_BUY @{avg_buy:.2f}")
            if s['price'] > avg_buy:
                print("  => WIN!")
            else:
                print("  => LOSS/BREAKEVEN")