import requests

URL = 'http://127.0.0.1:8000/api/login/'
USERNAME = 'admin'
PASSWORD = '123456'

for i in range(10):
    res = requests.post(URL, data = {
        'username': USERNAME,
        'password': PASSWORD
    })
    try:
        data = res.json()
    except Exception:
        data = res.text
    print(f"[{i+1}] Status: {res.status_code}, Response: {data}")
