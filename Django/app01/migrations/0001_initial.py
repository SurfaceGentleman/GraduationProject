# Generated by Django 3.1.7 on 2021-03-07 01:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AnswerRecord',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('is_true', models.BooleanField(default=0)),
            ],
            options={
                'db_table': 'answer_record',
            },
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('text', models.CharField(max_length=512)),
                ('score', models.IntegerField(default=1)),
                ('is_right', models.BooleanField(default=True)),
                ('type', models.IntegerField(default=1)),
            ],
            options={
                'db_table': 'question',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=20)),
                ('password', models.CharField(max_length=52)),
            ],
            options={
                'db_table': 'user',
            },
        ),
        migrations.CreateModel(
            name='UserDetail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('is_super', models.BooleanField(default=False)),
                ('icon', models.ImageField(default='test', upload_to='')),
                ('describe', models.CharField(blank=True, max_length=256)),
                ('user_id', models.OneToOneField(on_delete=django.db.models.deletion.DO_NOTHING, to='app01.user')),
            ],
            options={
                'db_table': 'userDetail',
            },
        ),
        migrations.CreateModel(
            name='TestRecord',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('score', models.IntegerField(default=0)),
                ('test_name', models.CharField(default='', max_length=256)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='app01.user')),
            ],
            options={
                'db_table': 'test_record',
            },
        ),
        migrations.CreateModel(
            name='QuestionList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default='', max_length=512)),
                ('question', models.ManyToManyField(related_name='question_list', to='app01.Question')),
            ],
            options={
                'db_table': 'questionList',
            },
        ),
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('text', models.CharField(max_length=512)),
                ('is_true', models.BooleanField(default=False)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='app01.question')),
            ],
            options={
                'db_table': 'option',
            },
        ),
        migrations.CreateModel(
            name='ChoseOptions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_delete', models.BooleanField(choices=[(0, '未删除'), (1, '删除')], default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('last_update_time', models.DateTimeField(auto_now=True)),
                ('answer_record', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='app01.answerrecord')),
                ('options', models.OneToOneField(on_delete=django.db.models.deletion.DO_NOTHING, to='app01.option')),
            ],
            options={
                'db_table': 'chose_options',
            },
        ),
        migrations.AddField(
            model_name='answerrecord',
            name='chose_options',
            field=models.ManyToManyField(to='app01.Option'),
        ),
        migrations.AddField(
            model_name='answerrecord',
            name='questio',
            field=models.OneToOneField(on_delete=django.db.models.deletion.DO_NOTHING, to='app01.question'),
        ),
        migrations.AddField(
            model_name='answerrecord',
            name='test_record',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='answer_set', to='app01.testrecord'),
        ),
    ]