# Generated by Django 5.0 on 2024-06-11 08:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_remove_customuser_otp_enabled_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='email_otp_enabled',
            new_name='otp_verified',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='email_otp_verified',
        ),
    ]