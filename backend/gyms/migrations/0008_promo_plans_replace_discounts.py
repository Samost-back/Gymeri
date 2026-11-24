from django.db import migrations, models


class Migration(migrations.Migration):
    """Promo plans replace discounts. Discounts are dropped, not converted: "-15% on a month"
    has no promo-plan equivalent, and there is no production data yet; `make seed` loads the
    demo promos."""

    dependencies = [
        ("gyms", "0007_rename_amenity_to_gym_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="membershipplan",
            name="is_promo",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="membershipplan",
            name="promo_ends_on",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddConstraint(
            model_name="membershipplan",
            constraint=models.CheckConstraint(
                condition=models.Q(promo_ends_on__isnull=True) | models.Q(is_promo=True),
                name="plan_promo_end_needs_promo",
            ),
        ),
        # Its table goes with its constraints.
        migrations.DeleteModel(name="Discount"),
    ]
