class MembershipsError(Exception):
    """Base for memberships domain errors, so callers can catch the whole family at once."""


class InvalidTerms(MembershipsError):
    """Terms a membership can't have, e.g. zero days or a negative price."""


class VisitNotAllowed(MembershipsError):
    """A visit the membership can't take: outside its dates, over the limit, or a second one
    on the same day."""

