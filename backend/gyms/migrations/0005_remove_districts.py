import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gyms", "0004_gym_street_from_address"),
    ]

    operations = [
        migrations.AlterField(
            model_name="gym",
            name="street",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="gyms",
                to="gyms.street",
            ),
        ),
        migrations.RemoveField(model_name="gym", name="address"),
        migrations.RemoveField(model_name="gym", name="district"),
        migrations.DeleteModel(name="District"),
    ]
