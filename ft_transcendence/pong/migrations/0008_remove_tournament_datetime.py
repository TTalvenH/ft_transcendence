# Generated by Django 5.0 on 2024-06-03 11:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0007_remove_tournament_final_remove_tournament_matchone_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='dateTime',
        ),
    ]