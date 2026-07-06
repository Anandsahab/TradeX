import requests
import time

BASE = 'http://127.0.0.1:5000/api'

print("=== CREATING A WINNING TRADE ===")

# Login
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}
print(f"Logged in: {r.json()['user']['username']}")

# First, let's manually set a holding to show profit potential
# We need to see if ADANI has been bought at different prices
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json()['transactions']

# Check all ADANI transactions
adani = [t for t in txs if t['symbol'] == 'ADANI']
print("\nADANI Transaction History:")
for t in adani:
    print(f"  {t['type']} x{t['qty']} @ {t['price']} = {t['total']}")

# Get portfolio
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
print(f"\nCurrent Wallet: {pf.get('wallet')}")
print(f"Current Holdings: {[(h['symbol'], h['qty']) for h in pf.get('holdings')]}")

# Let's create a winning trade by setting a specific scenario
# First we need to add a holding with lower avg price
# Let's buy at current price then immediately try to sell at higher (this won't work in real but we can simulate)

# Better approach: Let's check the price difference in our history
# Get current LIVE price and compare to our buy prices
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json()['prices']

print("\n=== LIVE PRICES vs OUR HOLDINGS ===")
for h in pf.get('holdings', []):
    sym = h['symbol']
    live = prices.get(sym, {}).get('price', 0)
    avg = h['avgPrice']
    diff = live - avg
    print(f"  {sym}: avg={avg}, live={live}, diff={diff:.2f}")

print("\n=== To Win: LIVE > AVG ===")
for h in pf.get('holdings', []):
    sym = h['symbol']
    live = prices.get(sym, {}).get('price', 0)
    avg = h['avgPrice']
    if live > avg:
        # Sell now for profit!
        qty = min(h['qty'], 1)
        print(f"WINNING: Sell {qty} {sym} @ {live} (bought @ {avg})")
        r = requests.post(f"{BASE}/sell", json={'symbol': sym, 'qty': qty}, headers=headers)
        if r.json().get('success'):
            print(f"  SOLD! Proceeds: {r.json()['proceeds']}")

# Check updated analytics
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
an = r.json()
print(f"\nUpdated Win Rate: {an.get('winRate')}%")
print(f"Total P/L: {an.get('totalPnl')}")