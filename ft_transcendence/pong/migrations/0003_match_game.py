# Generated by Django 5.0 on 2024-05-31 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0002_match_delete_pongmatch'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='game',
            field=models.CharField(default='Pong', max_length=20),
        ),
    ]
