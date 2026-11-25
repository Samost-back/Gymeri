from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from memberships.models import Membership
from memberships.services import MembershipService, Terms

DEMO_EMAIL = "demo@gymeri.local"
# A known password is the point of a demo account, which is why the command refuses to run
# outside DEBUG.
DEMO_PASSWORD = "Demo-pass-2026"  # noqa: S105
DEMO_GYM = "interatletika-voli"


class Command(BaseCommand):
    help = (
        "Create the demo client with a chosen gym and two different memberships. "
        "Needs seed_demo first. Safe to run again: the memberships are rebuilt around today."
    )

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        if not settings.DEBUG:
            raise CommandError("The demo client has a published password; DEBUG only.")

        user, _ = get_user_model().objects.get_or_create(email=DEMO_EMAIL)
        user.set_password(DEMO_PASSWORD)
        user.save()
        # Dates are relative to today, so a rerun replaces the old ones instead of piling up.
        Membership.objects.filter(owner=user).delete()

        # Through the service, so the demo obeys the same rules as a real client.
        service = MembershipService()
        service.choose_gym(user, DEMO_GYM)
        today = timezone.localdate()
        service.add(
            user,
            Terms("Повний безліміт на місяць у всі зали", Decimal("1350"), 30, None),
            today - timedelta(days=25),
        )
        pack = service.add(
            user, Terms("12 тренувань на місяць", Decimal("900"), 30, 12), today - timedelta(days=9)
        )
        for days_ago in (9, 7, 4, 2):
            service.record_visit(user, pack.id, today=today - timedelta(days=days_ago))

        self.stdout.write(self.style.SUCCESS(f"Demo client: {DEMO_EMAIL} / {DEMO_PASSWORD}"))
