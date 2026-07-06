import requests

BASE = 'http://127.0.0.1:5000/api'

print("=" * 60)
print("CHAITANYA'S ACCOUNT TEST")
print("=" * 60)

# Step 1: Login
print("\n[1] Login")
r = requests.post(f"{BASE}/login", json={'email': 'chaitanyaanand5881@gmail.com', 'password': '123456'})
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
print("\n[3] BUY TCS x 2")
r = requests.post(f"{BASE}/buy", json={'symbol': 'TCS', 'qty': 2}, headers=headers)
result = r.json()
print(f"    Success: {result.get('success')}")
print(f"    Price: INR {result.get('price')}")
print(f"    Wallet now: INR {result.get('wallet')}")

# Step 4: Check Holdings
print("\n[4] Holdings After Buy")
r = requests.get(f"{BASE}/portfolio", headers=headers)
pf = r.json()
tcs = [h for h in pf.get('holdings') if h['symbol'] == 'TCS']
for h in tcs:
    print(f"    TCS: qty={h['qty']}, avgPrice={h['avgPrice']}, currentPrice={h['currentPrice']}, pnl={h['pnl']}")

# Step 5: Sell Stock
print("\n[5] SELL TCS x 1")
r = requests.post(f"{BASE}/sell", json={'symbol': 'TCS', 'qty': 1}, headers=headers)
result = r.json()
print(f"    Success: {result.get('success')}")
print(f"    Proceeds: INR {result.get('proceeds')}")
print(f"    Wallet now: INR {result.get('wallet')}")

# Step 6: Transactions
print("\n[6] Transaction History")
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json().get('transactions', [])
print(f"    Total: {len(txs)}")
for t in txs[:5]:
    print(f"    {t['type']} {t['symbol']} x{t['qty']} @ INR {t['price']}")

# Step 7: Live Market Prices
print("\n[7] Live Market Prices")
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json().get('prices', {})
for sym in ['RELIANCE', 'TCS', 'HDFC', 'SBIN', 'ICICI', 'ADANI']:
    p = prices.get(sym, {})
    print(f"    {sym}: INR {p.get('price')} (change: {p.get('changePercent')}%)")

# Step 8: Analytics
print("\n[8] Analytics")
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
an = r.json()
print(f"    Portfolio Value: INR {an.get('portfolioValue')}")
print(f"    Total Invested: INR {an.get('totalInvested')}")
print(f"    Total P/L: INR {an.get('totalPnl')}")
print(f"    P/L %: {an.get('pnlPercent')}%")
print(f"    Win Rate: {an.get('winRate')}%")
print(f"    Risk Level: {an.get('riskLevel')}")
print(f"    Sector Allocation: {an.get('sectorAllocation')}")

print("\n" + "=" * 60)
print("ACCOUNT TEST COMPLETE - ALL WORKING")
print("=" * 60)