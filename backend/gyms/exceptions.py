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


class InvalidPromo(GymsError):
    """Promo dates that make no sense: an end date on a regular plan or one in the past."""


class GymNotFound(GymsError):
    """No published gym with this slug; drafts look the same as missing gyms to visitors."""
