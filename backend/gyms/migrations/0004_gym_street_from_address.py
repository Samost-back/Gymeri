from django.db import migrations


def split_address(address: str) -> tuple[str, str]:
    """'вул. Конякіна, 14' -> ('вул. Конякіна', '14'); text without a comma is all street."""
    street, comma, building = address.rpartition(",")
    if not comma:
        return address.strip(), ""
    return street.strip(), building.strip()


def move_addresses_to_streets(apps, schema_editor):
    Gym = apps.get_model("gyms", "Gym")
    Street = apps.get_model("gyms", "Street")
    for gym in Gym.objects.all():
        street_name, building = split_address(gym.address)
        street, _ = Street.objects.get_or_create(
            name=street_name,
            # A placeholder slug, unique per street; seed_demo and the admin set real ones.
            defaults={"slug": f"street-{Street.objects.count() + 1}"},
        )
        gym.street = street
        gym.building = building
        gym.save(update_fields=["street", "building"])


class Migration(migrations.Migration):
    dependencies = [
        ("gyms", "0003_street"),
    ]

    operations = [
        migrations.RunPython(move_addresses_to_streets, migrations.RunPython.noop),
    ]
