from dataclasses import dataclass
from decimal import Decimal

from .exceptions import InvalidLocation

MAX_LATITUDE = 90
MAX_LONGITUDE = 180


@dataclass(frozen=True)
class GeoPoint:
    """A point on the map; always holds both coordinates within the valid ranges."""

    latitude: Decimal
    longitude: Decimal

    def __post_init__(self) -> None:
        if abs(self.latitude) > MAX_LATITUDE:
            raise InvalidLocation(f"Latitude must be within ±{MAX_LATITUDE}, got {self.latitude}.")
        if abs(self.longitude) > MAX_LONGITUDE:
            raise InvalidLocation(
                f"Longitude must be within ±{MAX_LONGITUDE}, got {self.longitude}."
            )

    @classmethod
    def from_optional(
        cls, latitude: Decimal | None, longitude: Decimal | None
    ) -> "GeoPoint | None":
        """None when the location is not set yet; half a location is an error, not a point."""
        if latitude is None and longitude is None:
            return None
        if latitude is None or longitude is None:
            raise InvalidLocation("Set both latitude and longitude, or neither.")
        return cls(latitude, longitude)
