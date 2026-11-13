class GymsError(Exception):
    """Base for gyms domain errors, so callers can catch the whole family at once."""


class InvalidSchedule(GymsError):
    pass
