import requests

r = requests.post('http://127.0.0.1:5000/api/register', json={
    'username': 'Anand',
    'email': 'anand5881@gmail.com',
    'password': '123456'
})
print(r.json())