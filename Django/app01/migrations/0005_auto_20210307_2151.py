# Generated by Django 3.1.7 on 2021-03-07 13:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app01', '0004_auto_20210307_2132'),
    ]

    operations = [
        migrations.RenameField(
            model_name='choseoptions',
            old_name='options',
            new_name='option',
        ),
    ]
