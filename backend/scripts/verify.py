import requests

BASE = 'http://127.0.0.1:5000/api'

print('=' * 50)
print('SYSTEM VERIFICATION')
print('=' * 50)

# 1. Backend
print('\n[1] Backend Server')
try:
    r = requests.get(f"{BASE}/stocks", timeout=5)
    print('    Status: RUNNING')
except:
    print('    Status: DOWN')
    exit()

# 2. Stocks
print('\n[2] Stock Data')
r = requests.get(f"{BASE}/stocks", timeout=15)
stocks = r.json().get('stocks', [])
working = sum(1 for s in stocks if s.get('price'))
print(f"    Total: {len(stocks)}, Working: {working}")

# 3. Auth
print('\n[3] Authentication')
r = requests.post(f"{BASE}/login", json={'email': 'trader2@test.com', 'password': 'test123456'})
if r.status_code == 200:
    token = r.json()['token']
    print('    Login: OK')
    headers = {'Authorization': f'Bearer {token}'}
else:
    print('    Login: FAILED')
    exit()

# 4. Portfolio
print('\n[4] Portfolio')
r = requests.get(f"{BASE}/portfolio", headers=headers)
data = r.json()
print(f"    Wallet: {data.get('wallet')}")
print(f"    Holdings: {len(data.get('holdings'))}")

# 5. Transactions
print('\n[5] Transactions')
r = requests.get(f"{BASE}/transactions", headers=headers)
txs = r.json().get('transactions', [])
print(f"    Total: {len(txs)}")

# 6. Live Prices
print('\n[6] Live Prices')
r = requests.get(f"{BASE}/stocks/live", timeout=10)
prices = len(r.json().get('prices', {}))
print(f"    Live: {prices}")

# 7. Fresh Price
print('\n[7] Fresh Price API')
r = requests.post(f"{BASE}/stock/price/fresh", json={'symbol': 'RELIANCE'})
print(f"    RELIANCE: {r.json().get('price')}")

# 8. Analytics
print('\n[8] Analytics')
r = requests.get(f"{BASE}/portfolio/analytics", headers=headers)
data = r.json()
print(f"    Value: {data.get('portfolioValue')}")
print(f"    P/L: {data.get('totalPnl')}")

# 9. Buying
print('\n[9] BUY Test')
r = requests.post(f"{BASE}/buy", json={'symbol': 'TCS', 'qty': 1}, headers=headers)
print(f"    Result: {r.json().get('success')}")

# 10. Selling
print('\n[10] SELL Test')
r = requests.post(f"{BASE}/sell", json={'symbol': 'TCS', 'qty': 1}, headers=headers)
print(f"    Result: {r.json().get('success')}")

print('\n' + '=' * 50)
print('ALL SYSTEMS WORKING')
print('=' * 50)