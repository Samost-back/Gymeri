class GymsError(Exception):
    """Base for gyms domain errors, so callers can catch the whole family at once."""


class InvalidSchedule(GymsError):
    pass


class InvalidFilter(GymsError):
    """The client sent search parameters we can't apply."""


class InvalidLocation(GymsError):
    """Coordinates that can't be a point on the map."""


class GymNotPublishable(GymsError):
    """The gym lacks data the public catalog relies on."""


class InvalidDiscount(GymsError):
    """A discount that can't be applied: zero, over 100% or more than the price."""
