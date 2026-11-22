import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gyms", "0002_gym_location_constraints"),
    ]

    operations = [
        migrations.CreateModel(
            name="Street",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=100, unique=True)),
                ("slug", models.SlugField(max_length=100, unique=True)),
            ],
            options={"ordering": ["name"]},
        ),
        # Nullable for now: 0004 fills it from the old address text, 0005 makes it required.
        migrations.AddField(
            model_name="gym",
            name="street",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="gyms",
                to="gyms.street",
            ),
        ),
        migrations.AddField(
            model_name="gym",
            name="building",
            field=models.CharField(default="", max_length=20),
            preserve_default=False,
        ),
    ]
