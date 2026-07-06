import requests

BASE = 'http://127.0.0.1:5000/api'

print("=" * 60)
print("TRADEX - BUY & SELL STOCKS")
print("=" * 60)

# Login
print("\n[LOGIN]")
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
if r.status_code != 200:
    print(f"LOGIN FAILED: {r.json()}")
    exit()
token = r.json()['token']
print(f"Logged in as: {r.json()['user']['username']}")
headers = {'Authorization': f'Bearer {token}'}

# Show current portfolio
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
print(f"\n[WALLET] INR {pf.get('wallet')}")
print(f"[HOLDINGS] {[(h['symbol'], h['qty']) for h in pf.get('holdings')]}")

# Show live prices
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json().get('prices', {})
print(f"\n[LIVE PRICES]")
for sym, p in list(prices.items())[:10]:
    print(f"  {sym}: INR {p['price']} ({p['changePercent']}%)")

# BUY example
print("\n[BUY EXAMPLE]")
print("Buying 2 shares of SBIN...")
r = requests.post(f"{BASE}/buy", json={'symbol': 'SBIN', 'qty': 2}, headers=headers)
result = r.json()
if result.get('success'):
    print(f"SUCCESS! Bought 2 SBIN @ INR {result['price']}")
    print(f"Total: INR {result['total']}")
    print(f"Wallet: INR {result['wallet']}")
else:
    print(f"FAILED: {result}")

# SELL example
print("\n[SELL EXAMPLE]")
print("Selling 1 share of SBIN...")
r = requests.post(f"{BASE}/sell", json={'symbol': 'SBIN', 'qty': 1}, headers=headers)
result = r.json()
if result.get('success'):
    print(f"SUCCESS! Sold 1 SBIN @ INR {result['price']}")
    print(f"Proceeds: INR {result['proceeds']}")
    print(f"Wallet: INR {result['wallet']}")
else:
    print(f"FAILED: {result}")

# Final portfolio
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
print(f"\n[FINAL WALLET] INR {pf.get('wallet')}")
print(f"[FINAL HOLDINGS] {[(h['symbol'], h['qty']) for h in pf.get('holdings')]}")

# Live prices again
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json().get('prices', {})
print(f"\n[LIVE PRICES - UPDATED]")
for sym in ['RELIANCE', 'TCS', 'SBIN', 'ICICI']:
    p = prices.get(sym, {})
    print(f"  {sym}: INR {p.get('price')} ({p.get('changePercent')}%)")

print("\n" + "=" * 60)
print("TRADE COMPLETE!")
print("=" * 60)