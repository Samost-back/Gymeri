from django.db import migrations


class Migration(migrations.Migration):
    """Renames, not drop and create: existing gyms keep their types."""

    dependencies = [
        ("gyms", "0006_plan_audiences_and_discounts"),
    ]

    operations = [
        migrations.RenameModel(old_name="Amenity", new_name="GymType"),
        migrations.AlterModelOptions(name="gymtype", options={"ordering": ["name"]}),
        migrations.RenameField(model_name="gym", old_name="amenities", new_name="types"),
    ]
