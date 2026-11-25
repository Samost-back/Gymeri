class MembershipsError(Exception):
    """Base for memberships domain errors, so callers can catch the whole family at once."""


class InvalidTerms(MembershipsError):
    """Terms a membership can't have, e.g. zero days or a negative price."""


class VisitNotAllowed(MembershipsError):
    """A visit the membership can't take: outside its dates, over the limit, or a second one
    on the same day."""


class MembershipNotFound(MembershipsError):
    """No such membership among the client's own; someone else's looks the same as missing."""

    def __init__(self) -> None:
        super().__init__("Абонемент не знайдено.")


class GymNotAvailable(MembershipsError):
    """The chosen gym isn't in the public catalog."""

    def __init__(self) -> None:
        super().__init__("Такого залу немає в каталозі.")


class NoHomeGym(MembershipsError):
    """A membership is added to the client's gym, and there is none: not chosen yet, or the
    chosen one has left the catalog."""

    def __init__(self) -> None:
        super().__init__("Спершу оберіть свій зал.")
