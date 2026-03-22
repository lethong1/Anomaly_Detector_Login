import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'anomaly_detector_login.settings')
django.setup()

from django.contrib.auth.models import User

username = "admin"
password = "12345678"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, password=password)
    print("Superuser created")
else:
    print("Superuser already exists")