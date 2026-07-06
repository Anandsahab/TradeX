import requests

BASE = 'http://127.0.0.1:5000/api'

print("=" * 60)
print("USER TRADING FLOW TEST")
print("=" * 60)

# Step 1: Login
print("\n[STEP 1] Login as user")
r = requests.post(f"{BASE}/login", json={'email': 'trader2@test.com', 'password': 'test123456'})
data = r.json()
token = data['token']
headers = {'Authorization': f'Bearer {token}'}
print(f"    Logged in: {data.get('user', {}).get('username')}")

# Step 2: Check initial portfolio
print("\n[STEP 2] Initial Portfolio")
r = requests.get(f"{BASE}/portfolio", headers=headers)
before = r.json()
print(f"    Wallet: INR {before.get('wallet')}")
print(f"    Holdings: {[(h['symbol'], h['qty']) for h in before.get('holdings')]}")

# Step 3: Buy stock
print("\n[STEP 3] Buy SBIN x 10")
r = requests.post(f"{BASE}/buy", json={'symbol': 'SBIN', 'qty': 10}, headers=headers)
buy_result = r.json()
print(f"    Success: {buy_result.get('success')}")
print(f"    Price paid: INR {buy_result.get('total')}")
print(f"    New wallet: INR {buy_result.get('wallet')}")

# Step 4: Check portfolio after buy
print("\n[STEP 4] Portfolio After BUY")
r = requests.get(f"{BASE}/portfolio", headers=headers)
after_buy = r.json()
print(f"    Wallet: INR {after_buy.get('wallet')}")
print(f"    Holdings: {[(h['symbol'], h['qty']) for h in after_buy.get('holdings')]}")

# Step 5: Check transaction recorded
print("\n[STEP 5] Transaction History")
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json().get('transactions', [])
sbins = [t for t in txs if t['symbol'] == 'SBIN']
print(f"    SBIN transactions: {len(sbins)}")
if sbins:
    print(f"    Latest: {sbins[0]['type']} x{sbins[0]['qty']} @ INR {sbins[0]['price']}")

# Step 6: Sell stock
print("\n[STEP 6] Sell SBIN x 5")
r = requests.post(f"{BASE}/sell", json={'symbol': 'SBIN', 'qty': 5}, headers=headers)
sell_result = r.json()
print(f"    Success: {sell_result.get('success')}")
print(f"    Proceeds: INR {sell_result.get('proceeds')}")
print(f"    New wallet: INR {sell_result.get('wallet')}")

# Step 7: Check portfolio after sell
print("\n[STEP 7] Portfolio After SELL")
r = requests.get(f"{BASE}/portfolio", headers=headers)
after_sell = r.json()
print(f"    Wallet: INR {after_sell.get('wallet')}")
print(f"    Holdings: {[(h['symbol'], h['qty']) for h in after_sell.get('holdings')]}")

# Step 8: Check all transactions
print("\n[STEP 8] All SBIN Transactions")
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json().get('transactions', [])
sbins = [t for t in txs if t['symbol'] == 'SBIN']
for t in sbins[:5]:
    print(f"    {t['type']} x{t['qty']} @ INR {t['price']} = INR {t['total']}")

# Step 9: Analytics
print("\n[STEP 9] Portfolio Analytics")
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
analytics = r.json()
print(f"    Total Value: INR {analytics.get('portfolioValue')}")
print(f"    Total P/L: INR {analytics.get('totalPnl')}")
print(f"    Risk Level: {analytics.get('riskLevel')}")

# Step 10: Live prices update
print("\n[STEP 10] Live Prices")
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = r.json().get('prices', {})
print(f"    SBIN live: INR {prices.get('SBIN', {}).get('price')}")
print(f"    TCS live: INR {prices.get('TCS', {}).get('price')}")

print("\n" + "=" * 60)
print("TRADING FLOW COMPLETE - ALL UPDATING IN REAL TIME")
print("=" * 60)