import requests

BASE = 'http://127.0.0.1:5000/api'

print("=" * 60)
print("PROFITABLE TRADE - INCREASE WIN RATE")
print("=" * 60)

# Login
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
token = r.json()['token']
headers = {'Authorization': f'Bearer {token}'}
print(f"\nLogged in: {r.json()['user']['username']}")

# Get holdings with P/L
r = requests.get(f"{BASE}/portfolio", headers=headers)
holdings = r.json().get('holdings', [])

print("\n[HOLDINGS WITH P/L]")
print("-" * 50)
profitable = []
for h in holdings:
    pnl = h.get('pnl', 0)
    pnl_pct = h.get('pnlPercent', 0)
    status = "PROFIT" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN"
    print(f"{h['symbol']}: qty={h['qty']}, avgPrice={h['avgPrice']}, current={h['currentPrice']}, P/L={pnl} ({pnl_pct}%) [{status}]")
    if pnl > 0:
        profitable.append(h)

# Get live prices
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json().get('prices', {})

print("\n[LIVE MARKET PRICES]")
for sym in ['RELIANCE', 'TCS', 'SBIN', 'ICICI', 'ADANI', 'HINDUNILVR', 'MARUTI', 'BAJFINANCE']:
    p = prices.get(sym, {})
    if p:
        print(f"  {sym}: INR {p['price']} ({p.get('changePercent')}%)")

print("\n[PROFITABLE OPPORTUNITIES]")
if profitable:
    for h in profitable:
        print(f"  Sell {h['symbol']} x{h['qty']} @ INR {h['currentPrice']} = INR {h['currentValue']} (P/L: {h['pnl']})")
else:
    print("  No profitable holdings yet!")

# Make a profitable SELL
print("\n[SELL FOR PROFIT]")
if profitable:
    h = profitable[0]
    symbol = h['symbol']
    qty = min(h['qty'], 2)  # Sell 2 or less
    print(f"Selling {qty} shares of {symbol}...")
    r = requests.post(f"{BASE}/sell", json={'symbol': symbol, 'qty': qty}, headers=headers)
    result = r.json()
    if result.get('success'):
        print(f"SUCCESS! Sold {qty} {symbol} @ INR {result['price']}")
        print(f"Proceeds: INR {result['proceeds']}")
        print(f"New Wallet: INR {result['wallet']}")

# Now check updated analytics
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
an = r.json()
print(f"\n[UPDATED ANALYTICS]")
print(f"Win Rate: {an.get('winRate')}%")
print(f"Total Transactions: {an.get('totalTransactions')}")
print(f"Total P/L: INR {an.get('totalPnl')}")

print("\n" + "=" * 60)
print("PROFITABLE TRADE COMPLETE!")
print("=" * 60)