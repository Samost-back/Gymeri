from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class TimeStampedModel(models.Model):
    """Internal audit timestamps; not shown to users (prices rarely change)."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Street(models.Model):
    """A street gyms stand on; picked from a list, so one street never shows up twice."""

    # With the type prefix, as people say it: "вул. Конякіна", "просп. Волі".
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class GymType(models.Model):
    """A gym type users filter by: gym floor, crossfit, pool... Icons live in the frontend."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Audience(models.Model):
    """A group a plan is meant for: students, veterans... A plan with none is for everyone."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Chain(TimeStampedModel):
    """A brand. A standalone gym is a chain with one location, so every gym has a chain."""

    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=150, unique=True)
    short_name = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    # FileField keeps only the storage key, so the same value works on disk and on S3.
    logo = models.FileField(upload_to="chains/logos/", blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Gym(TimeStampedModel):
    """One physical location of a chain."""

    chain = models.ForeignKey(Chain, on_delete=models.PROTECT, related_name="gyms")
    street = models.ForeignKey(Street, on_delete=models.PROTECT, related_name="gyms")
    types = models.ManyToManyField(GymType, blank=True, related_name="gyms")

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    highlight = models.CharField(max_length=100, blank=True)
    # House number with its letter or block, e.g. "7А".
    building = models.CharField(max_length=20)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="In Google Maps right-click the building and copy the first number.",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="The second number from the same menu.",
    )
    area_m2 = models.PositiveIntegerField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # Hidden by default so a half-filled gym never reaches the public catalog.
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]
        # The same rules as GeoPoint and GymPublishingService, kept in the database too,
        # so data written past the admin (shell, seeds, future APIs) can't break the map.
        constraints = [
            models.CheckConstraint(
                condition=Q(latitude__isnull=True, longitude__isnull=True)
                | Q(latitude__isnull=False, longitude__isnull=False),
                name="gym_location_complete",
            ),
            models.CheckConstraint(
                condition=Q(latitude__isnull=True)
                | Q(latitude__gte=-90, latitude__lte=90, longitude__gte=-180, longitude__lte=180),
                name="gym_location_in_range",
            ),
            models.CheckConstraint(
                condition=Q(is_published=False) | Q(latitude__isnull=False),
                name="published_gym_has_location",
            ),
        ]

    def __str__(self) -> str:
        return self.name

    @property
    def address(self) -> str:
        return f"{self.street.name}, {self.building}"


class OpeningHours(models.Model):
    """One interval per weekday; a missing weekday means the gym is closed that day."""

    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="opening_hours")
    weekday = models.PositiveSmallIntegerField(choices=Weekday.choices)
    opens_at = models.TimeField()
    # closes_at <= opens_at means the gym closes after midnight; 00:00-00:00 is round the clock.
    closes_at = models.TimeField()

    class Meta:
        ordering = ["gym", "weekday"]
        verbose_name_plural = "opening hours"
        constraints = [
            models.UniqueConstraint(fields=["gym", "weekday"], name="unique_gym_weekday"),
        ]

    def __str__(self) -> str:
        return f"{self.gym} {self.get_weekday_display()} {self.opens_at}-{self.closes_at}"


class GymPhoto(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="photos")
    image = models.FileField(upload_to="gyms/photos/")
    alt = models.CharField(max_length=200)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["gym", "position"]

    def __str__(self) -> str:
        return f"{self.gym} #{self.position}"


class MembershipPlan(TimeStampedModel):
    """A price option, e.g. "1 month unlimited".

    Chains set most prices network-wide, so a plan belongs to a chain; an empty gym means
    the plan works in every gym of the chain, a filled one means it is sold only there.
    """

    chain = models.ForeignKey(Chain, on_delete=models.CASCADE, related_name="membership_plans")
    gym = models.ForeignKey(
        Gym, on_delete=models.CASCADE, null=True, blank=True, related_name="membership_plans"
    )
    name = models.CharField(max_length=100)
    # Decimal, not float: money must not lose kopecks to rounding.
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_days = models.PositiveSmallIntegerField()
    # Null means unlimited visits during the period.
    visits_limit = models.PositiveSmallIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    # Empty means anyone can buy it; such plans alone set the "from" price.
    audiences = models.ManyToManyField(Audience, blank=True, related_name="plans")

    class Meta:
        ordering = ["chain", "price"]
        constraints = [
            models.CheckConstraint(condition=Q(price__gte=0), name="plan_price_non_negative"),
            models.CheckConstraint(condition=Q(duration_days__gt=0), name="plan_duration_positive"),
            models.CheckConstraint(
                condition=Q(visits_limit__isnull=True) | Q(visits_limit__gt=0),
                name="plan_visits_limit_positive",
            ),
            models.UniqueConstraint(fields=["chain", "name"], name="unique_chain_plan_name"),
        ]

    def __str__(self) -> str:
        return f"{self.gym or self.chain}: {self.name}"

    def clean(self) -> None:
        # A database constraint can't compare across tables, so this rule is checked here.
        if self.gym_id and self.chain_id and self.gym.chain_id != self.chain_id:
            raise ValidationError({"gym": "The gym belongs to another chain."})


class PlanAccessWindow(models.Model):
    """Limits the hours a plan works on one weekday, e.g. a student plan only until 18:00.

    Weekdays without a window are not limited. An empty bound means the gym's own
    opening or closing time.
    """

    plan = models.ForeignKey(
        MembershipPlan, on_delete=models.CASCADE, related_name="access_windows"
    )
    weekday = models.PositiveSmallIntegerField(choices=OpeningHours.Weekday.choices)
    starts_at = models.TimeField(null=True, blank=True)
    ends_at = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ["plan", "weekday"]
        constraints = [
            models.UniqueConstraint(fields=["plan", "weekday"], name="unique_plan_weekday"),
            models.CheckConstraint(
                condition=Q(starts_at__isnull=False) | Q(ends_at__isnull=False),
                name="access_window_has_bound",
            ),
            models.CheckConstraint(
                condition=Q(starts_at__isnull=True)
                | Q(ends_at__isnull=True)
                | Q(starts_at__lt=models.F("ends_at")),
                name="access_window_starts_before_end",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.plan} {self.get_weekday_display()} {self.starts_at}-{self.ends_at}"


class Discount(TimeStampedModel):
    """A temporary promotion on a plan, valid until `ends_on` inclusive.

    Rules that need the plan's price, like a fixed amount below it, live in the domain
    Discount classes; the database keeps the ones it can check on its own.
    """

    class Kind(models.TextChoices):
        PERCENT = "percent", "Percent"
        FIXED = "fixed", "Fixed amount"

    plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE, related_name="discounts")
    kind = models.CharField(max_length=10, choices=Kind.choices)
    value = models.DecimalField(max_digits=8, decimal_places=2)
    ends_on = models.DateField()

    class Meta:
        ordering = ["plan", "ends_on"]
        constraints = [
            models.CheckConstraint(condition=Q(value__gt=0), name="discount_value_positive"),
            # Choices alone only guard forms; an unknown kind would break every price list.
            models.CheckConstraint(
                condition=Q(kind__in=["percent", "fixed"]), name="discount_kind_known"
            ),
            models.CheckConstraint(
                condition=Q(kind="fixed") | Q(value__lte=100),
                name="discount_percent_at_most_100",
            ),
        ]

    def __str__(self) -> str:
        unit = "%" if self.kind == self.Kind.PERCENT else " UAH"
        return f"{self.plan}: -{self.value}{unit} until {self.ends_on}"
