from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from gyms import demo_data
from gyms.models import (
    Amenity,
    Audience,
    Chain,
    Discount,
    Gym,
    MembershipPlan,
    OpeningHours,
    PlanAccessWindow,
    Street,
)


class Command(BaseCommand):
    help = "Load the demo gyms. Safe to run again: records are matched by slug and updated."

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        # Matched by name: the 0004 migration created streets from old addresses with
        # placeholder slugs, and this gives them the real ones.
        streets = {
            key: Street.objects.update_or_create(name=name, defaults={"slug": key})[0]
            for key, name in demo_data.STREETS.items()
        }
        amenities = {
            key: Amenity.objects.update_or_create(slug=key, defaults={"name": name})[0]
            for key, name in demo_data.AMENITIES.items()
        }
        audiences = {
            key: Audience.objects.update_or_create(slug=key, defaults={"name": name})[0]
            for key, name in demo_data.AUDIENCES.items()
        }

        for chain_data in demo_data.CHAINS:
            chain_fields = {**chain_data}
            plans = chain_fields.pop("plans", [])
            gyms = chain_fields.pop("gyms")
            chain, _ = Chain.objects.update_or_create(
                slug=chain_fields.pop("slug"), defaults=chain_fields
            )

            for plan_data in plans:
                self._save_plan(chain, plan_data, audiences)
            for gym_data in gyms:
                self._save_gym(chain, gym_data, streets, amenities)

        self.stdout.write(self.style.SUCCESS("Demo data loaded."))

    def _save_plan(self, chain: Chain, plan_data: dict, audiences: dict[str, Audience]) -> None:
        fields = {**plan_data}
        access = fields.pop("access")
        audience_keys = fields.pop("audiences")
        discounts = fields.pop("discounts")
        plan, _ = MembershipPlan.objects.update_or_create(
            chain=chain, name=fields.pop("name"), defaults=fields
        )
        plan.access_windows.all().delete()
        PlanAccessWindow.objects.bulk_create(
            PlanAccessWindow(plan=plan, weekday=day, starts_at=starts, ends_at=ends)
            for day, (starts, ends) in access.items()
        )
        plan.audiences.set(audiences[key] for key in audience_keys)
        today = timezone.localdate()
        plan.discounts.all().delete()
        Discount.objects.bulk_create(
            Discount(plan=plan, kind=kind, value=value, ends_on=today + timedelta(days=days))
            for kind, value, days in discounts
        )

    def _save_gym(
        self,
        chain: Chain,
        gym_data: dict,
        streets: dict[str, Street],
        amenities: dict[str, Amenity],
    ) -> None:
        fields = {**gym_data}
        hours = fields.pop("hours", {})
        amenity_keys = fields.pop("amenities", [])
        fields["street"] = streets[fields["street"]]
        fields.setdefault("is_published", True)

        gym, _ = Gym.objects.update_or_create(
            slug=fields.pop("slug"), defaults={"chain": chain, **fields}
        )
        gym.amenities.set(amenities[key] for key in amenity_keys)

        # Recreate rather than diff: the schedule is tiny and this keeps reruns exact.
        gym.opening_hours.all().delete()
        OpeningHours.objects.bulk_create(
            OpeningHours(gym=gym, weekday=day, opens_at=opens, closes_at=closes)
            for day, (opens, closes) in hours.items()
        )
