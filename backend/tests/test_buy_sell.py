import requests

BASE = 'http://127.0.0.1:5000/api'

print("=" * 60)
print("BUY/SELL TEST - chaitanyaanand5881@gmail.com")
print("=" * 60)

# Login
print("\n[LOGIN]")
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
if r.status_code != 200:
    print(f"FAILED: {r.json()}")
    exit()
token = r.json()['token']
print(f"Logged in as: {r.json()['user']['username']}")
headers = {'Authorization': f'Bearer {token}'}

# Check initial portfolio
print("\n[INITIAL PORTFOLIO]")
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
print(f"Wallet: INR {pf.get('wallet')}")
holdings = pf.get('holdings', [])
print(f"Holdings: {[(h['symbol'], h['qty']) for h in holdings]}")

# BUY STOCK
print("\n[BUY: ADANI x 3]")
r = requests.post(f"{BASE}/buy", json={'symbol': 'ADANI', 'qty': 3}, headers=headers)
result = r.json()
if result.get('success'):
    print(f"SUCCESS - Bought 3 ADANI @ INR {result.get('price')}")
    print(f"Total cost: INR {result.get('total')}")
    print(f"New wallet: INR {result.get('wallet')}")
else:
    print(f"FAILED: {result}")

# Check holdings after buy
print("\n[HOLDINGS AFTER BUY]")
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
adani = [h for h in pf.get('holdings') if h['symbol'] == 'ADANI']
print(f"ADANI: {adani[0] if adani else 'NOT FOUND'}")

# SELL STOCK
print("\n[SELL: ADANI x 2]")
r = requests.post(f"{BASE}/sell", json={'symbol': 'ADANI', 'qty': 2}, headers=headers)
result = r.json()
if result.get('success'):
    print(f"SUCCESS - Sold 2 ADANI @ INR {result.get('price')}")
    print(f"Proceeds: INR {result.get('proceeds')}")
    print(f"New wallet: INR {result.get('wallet')}")
else:
    print(f"FAILED: {result}")

# Check holdings after sell
print("\n[HOLDINGS AFTER SELL]")
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
adani = [h for h in pf.get('holdings') if h['symbol'] == 'ADANI']
print(f"ADANI: {adani[0] if adani else 'SOLD OUT'}")

# Check transactions
print("\n[TRANSACTION HISTORY]")
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json().get('transactions', [])
adani_txs = [t for t in txs if t['symbol'] == 'ADANI']
print(f"ADANI transactions: {len(adani_txs)}")
for t in adani_txs[:3]:
    print(f"  {t['type']} x{t['qty']} @ INR {t['price']} = INR {t['total']}")

# Check wallet
print("\n[FINAL WALLET]")
r = requests.get(f"{BASE}/portfolio", headers=headers)
print(f"Wallet: INR {r.json().get('wallet')}")

# Analytics
print("\n[ANALYTICS]")
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
an = r.json()
print(f"Portfolio Value: INR {an.get('portfolioValue')}")
print(f"Total P/L: INR {an.get('totalPnl')}")

print("\n" + "=" * 60)
print("BUY/SELL TEST COMPLETE")
print("=" * 60)