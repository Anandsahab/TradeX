import requests

BASE = 'http://127.0.0.1:5000/api'
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

print("=== Making a WINNING Trade ===")

# Get current holdings
r = requests.get(f"{BASE}/portfolio", headers=headers)
holdings = r.json()['holdings']

# Get live prices
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json()['prices']

print("\nHoldings vs Live Prices:")
for h in holdings:
    sym = h['symbol']
    avg = h['avgPrice']
    live = prices.get(sym, {}).get('price', 0)
    diff = live - avg
    print(f"  {sym}: avg={avg}, live={live}, diff={diff:.2f}")

# Find winning opportunity
for h in holdings:
    sym = h['symbol']
    avg = h['avgPrice']
    live = prices.get(sym, {}).get('price', 0)
    if live > avg:
        print(f"\nWINNING: Sell {h['qty']} {sym} @ {live} (bought @ {avg})")
        r = requests.post(f"{BASE}/sell", json={'symbol': sym, 'qty': min(h['qty'], 1)}, headers=headers)
        if r.json().get('success'):
            print(f"  SOLD! Proceeds: {r.json()['proceeds']}")

# Check analytics
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
an = r.json()
print(f"\nWin Rate: {an.get('winRate')}%")
print(f"Total Transactions: {an.get('totalTransactions')}")