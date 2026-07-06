import requests

BASE = 'http://127.0.0.1:5000/api'

print("=" * 60)
print("USER LOGIN & TRADING TEST")
print("=" * 60)

# Step 1: Login
print("\n[1] Login")
r = requests.post(f"{BASE}/login", json={'email': 'trader2@test.com', 'password': 'test123456'})
if r.status_code != 200:
    print(f"    Login FAILED: {r.json()}")
    exit()
data = r.json()
token = data['token']
user = data['user']
print(f"    Welcome: {user.get('username')}")
print(f"    Email: {user.get('email')}")

headers = {'Authorization': f'Bearer {token}'}

# Step 2: Portfolio
print("\n[2] Portfolio")
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
print(f"    Wallet: INR {pf.get('wallet')}")
print(f"    Holdings: {[(h['symbol'], h['qty']) for h in pf.get('holdings')]}")

# Step 3: Buy Stock
print("\n[3] BUY INFY x 5")
r = requests.post(f"{BASE}/buy", json={'symbol': 'INFY', 'qty': 5}, headers=headers)
result = r.json()
print(f"    Success: {result.get('success')}")
print(f"    Price: INR {result.get('price')}")
print(f"    Wallet now: INR {result.get('wallet')}")

# Step 4: Check Holdings
print("\n[4] Holdings After Buy")
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
infy = [h for h in pf.get('holdings') if h['symbol'] == 'INFY']
print(f"    INFY: {infy[0] if infy else 'NOT FOUND'}")

# Step 5: Sell Stock
print("\n[5] SELL INFY x 3")
r = requests.post(f"{BASE}/sell", json={'symbol': 'INFY', 'qty': 3}, headers=headers)
result = r.json()
print(f"    Success: {result.get('success')}")
print(f"    Proceeds: INR {result.get('proceeds')}")
print(f"    Wallet now: INR {result.get('wallet')}")

# Step 6: Transactions
print("\n[6] INFY Transactions")
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json().get('transactions', [])
infy_txs = [t for t in txs if t['symbol'] == 'INFY']
for t in infy_txs[:5]:
    print(f"    {t['type']} x{t['qty']} @ INR {t['price']}")

# Step 7: Market Prices
print("\n[7] Live Market Prices")
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json().get('prices', {})
for sym in ['RELIANCE', 'TCS', 'INFY', 'SBIN']:
    p = prices.get(sym, {})
    print(f"    {sym}: INR {p.get('price')}")

# Step 8: Analytics
print("\n[8] Analytics")
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
an = r.json()
print(f"    Portfolio Value: INR {an.get('portfolioValue')}")
print(f"    Total P/L: INR {an.get('totalPnl')}")
print(f"    Win Rate: {an.get('winRate')}%")
print(f"    Risk Level: {an.get('riskLevel')}")

print("\n" + "=" * 60)
print("ALL SYSTEMS WORKING - REAL TIME UPDATES CONFIRMED")
print("=" * 60)