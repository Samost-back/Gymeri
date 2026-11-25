class AccountsError(Exception):
    """Base for accounts domain errors, so callers can catch the whole family at once."""


class EmailTaken(AccountsError):
    def __init__(self) -> None:
        super().__init__("Акаунт з таким email уже існує.")


class InvalidCredentials(AccountsError):
    """Wrong email or password; one message for both, so sign-in doesn't tell which emails
    are registered."""

    def __init__(self) -> None:
        super().__init__("Невірний email або пароль.")


class WeakPassword(AccountsError):
    """The password failed Django's validators; the message lists every reason at once, so
    the user fixes them in one go."""

    def __init__(self, reasons: list[str]) -> None:
        super().__init__(" ".join(reasons))


class NotSignedIn(AccountsError):
    def __init__(self) -> None:
        super().__init__("Потрібно увійти.")
