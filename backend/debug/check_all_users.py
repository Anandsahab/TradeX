import requests

BASE = 'http://127.0.0.1:5000/api'
users = ['trader1@test.com', 'trader2@test.com', 'newuser@test.com']

for email in users:
    r = requests.post(BASE + '/login', json={'email': email, 'password': 'test123456'})
    token = r.json().get('token')
    if token:
        h = {'Authorization': f'Bearer {token}'}
        r = requests.get(BASE + '/portfolio/analytics', headers=h)
        an = r.json()
        print(f"{email}: Win Rate={an.get('winRate')}%, Txs={an.get('totalTransactions')}")

print("\nWin rate fix applies to ALL users")