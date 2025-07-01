import requests
import random

URL = "http://localhost:8000/api/login/"
USERNAME = "admin"
PASSWORD = "wrong123"
HOST_IP_LIST = [
    "192.168.10.1",
    "192.168.10.2",
    "192.168.10.3",
    "192.168.10.4",
    "192.168.10.5",
]

for i in range(30):
    fake_ip = random.choice(HOST_IP_LIST)

    headers = {
        "X-Forwarded-For": fake_ip,
        "User-Agent": f"BotNetTest/{i}"
    }

    res = requests.post(URL, data={
        'username': USERNAME,
        'password': PASSWORD
    }, headers=headers)

    print(f"[{i+1}] IP: {fake_ip} | Status: {res.status_code} → {res.text}")
