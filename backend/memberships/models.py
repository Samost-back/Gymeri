from django.conf import settings
from django.db import models
from django.db.models import Q


class HomeGym(models.Model):
    """The gym a client picked in their account; one per client, and it can be changed."""

    # One row per user instead of a field on User: accounts stays unaware of gyms.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="home_gym"
    )
    # A string reference: apps don't import each other's models.
    gym = models.ForeignKey("gyms.Gym", on_delete=models.CASCADE, related_name="+")

    def __str__(self) -> str:
        return f"{self.user}: {self.gym}"


class Membership(models.Model):
    """A membership a client bought. Its terms are a copy of the gym's plan at the time, so
    a later price change or a removed plan doesn't rewrite what the client has."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships"
    )
    # PROTECT: deleting a gym must not silently wipe clients' memberships.
    gym = models.ForeignKey("gyms.Gym", on_delete=models.PROTECT, related_name="+")
    name = models.CharField(max_length=100)
    # Decimal, not float: money must not lose kopecks to rounding.
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_days = models.PositiveSmallIntegerField()
    # Null means unlimited visits during the period.
    visits_limit = models.PositiveSmallIntegerField(null=True, blank=True)
    starts_on = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-starts_on", "-id"]
        # The same rules as the domain classes, kept in the database too for rows written
        # past the service (admin, shell, seeds).
        constraints = [
            models.CheckConstraint(condition=Q(price__gte=0), name="membership_price_non_negative"),
            models.CheckConstraint(
                condition=Q(duration_days__gt=0), name="membership_duration_positive"
            ),
            models.CheckConstraint(
                condition=Q(visits_limit__isnull=True) | Q(visits_limit__gt=0),
                name="membership_visits_limit_positive",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.owner}: {self.name} з {self.starts_on:%d.%m.%Y}"


class Visit(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name="visits")
    day = models.DateField()

    class Meta:
        ordering = ["day"]
        constraints = [
            # One visit a day, as in VisitPackMembership; also stops a double tap racing itself.
            models.UniqueConstraint(fields=["membership", "day"], name="one_visit_a_day"),
        ]

    def __str__(self) -> str:
        return f"{self.membership.name}: {self.day:%d.%m.%Y}"
