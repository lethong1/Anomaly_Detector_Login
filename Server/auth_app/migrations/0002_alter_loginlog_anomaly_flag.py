# Generated by Django 5.2.3 on 2025-07-08 05:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loginlog',
            name='anomaly_flag',
            field=models.CharField(choices=[('normal', 'Normal'), ('suspicious', 'Suspicious'), ('blocked', 'Blocked'), ('new_ip', 'New Ip Detected')], default='normal', max_length=100),
        ),
    ]
