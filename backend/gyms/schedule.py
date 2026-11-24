"""Weekly opening hours and plan access hours as plain Python value objects, independent
of Django."""

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime, time
from types import MappingProxyType

from .exceptions import InvalidSchedule

WEEKDAY_NAMES = ("Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд")
DAYS_IN_WEEK = len(WEEKDAY_NAMES)


def _frozen_week[T](days: Mapping[int, T]) -> Mapping[int, T]:
    """A read-only copy of weekday-keyed values; a frozen dataclass alone would still let the
    dict be changed."""
    invalid = [day for day in days if day not in range(DAYS_IN_WEEK)]
    if invalid:
        raise InvalidSchedule(f"Unknown weekdays: {invalid}")
    return MappingProxyType(dict(days))


@dataclass(frozen=True)
class TimeInterval:
    """Opening hours of one day.

    closes < opens means the gym closes after midnight; opens == closes means round the clock.
    """

    opens: time
    closes: time

    @property
    def is_full_day(self) -> bool:
        return self.opens == self.closes

    @property
    def crosses_midnight(self) -> bool:
        return self.closes < self.opens

    def contains_on_its_day(self, moment: time) -> bool:
        if self.is_full_day:
            return True
        if self.crosses_midnight:
            return moment >= self.opens
        return self.opens <= moment < self.closes

    def contains_after_midnight(self, moment: time) -> bool:
        """Whether the moment on the next day is still inside this interval."""
        return self.crosses_midnight and moment < self.closes

    def __str__(self) -> str:
        return f"{self.opens:%H:%M}–{self.closes:%H:%M}"


@dataclass(frozen=True)
class WeeklySchedule:
    """Opening hours for a week: weekday (0 = Monday) to interval; a missing day is closed."""

    days: Mapping[int, TimeInterval]

    def __post_init__(self) -> None:
        object.__setattr__(self, "days", _frozen_week(self.days))

    def is_open_at(self, moment: datetime) -> bool:
        today = self.days.get(moment.weekday())
        yesterday = self.days.get((moment.weekday() - 1) % DAYS_IN_WEEK)
        clock = moment.time()
        return bool(
            (today and today.contains_on_its_day(clock))
            or (yesterday and yesterday.contains_after_midnight(clock))
        )

    def is_round_the_clock(self) -> bool:
        return len(self.days) == DAYS_IN_WEEK and all(
            interval.is_full_day for interval in self.days.values()
        )

    def week(self) -> list[tuple[int, TimeInterval | None]]:
        """All seven weekdays from Monday, with None for the days the gym is closed."""
        return [(day, self.days.get(day)) for day in range(DAYS_IN_WEEK)]

    def summary(self) -> str:
        """Human-readable hours with equal neighbouring days merged: "Пн–Сб 08:00–21:30"."""
        if not self.days:
            return ""
        if self.is_round_the_clock():
            return "Цілодобово"

        groups: list[tuple[int, int, TimeInterval | None]] = []
        for day in range(DAYS_IN_WEEK):
            interval = self.days.get(day)
            if groups and groups[-1][2] == interval:
                first, _, _ = groups[-1]
                groups[-1] = (first, day, interval)
            else:
                groups.append((day, day, interval))

        if len(groups) == 1:
            return f"Щодня {groups[0][2]}"
        return ", ".join(self._format_group(*group) for group in groups)

    @staticmethod
    def _format_group(first: int, last: int, interval: TimeInterval | None) -> str:
        days = WEEKDAY_NAMES[first]
        if last != first:
            days += f"–{WEEKDAY_NAMES[last]}"
        return f"{days} {interval or 'вихідний'}"


@dataclass(frozen=True)
class AccessWindow:
    """Hours a plan lets its holder in on one weekday, e.g. a student plan only until 18:00.

    An empty bound means the gym's own opening or closing time.
    """

    starts: time | None = None
    ends: time | None = None

    def __post_init__(self) -> None:
        if self.starts is None and self.ends is None:
            raise InvalidSchedule("An access window needs a start, an end or both.")
        if self.starts is not None and self.ends is not None and self.starts >= self.ends:
            raise InvalidSchedule("An access window must start before it ends.")

    def __str__(self) -> str:
        if self.starts is None:
            return f"до {self.ends:%H:%M}"
        if self.ends is None:
            return f"з {self.starts:%H:%M}"
        return f"{self.starts:%H:%M}–{self.ends:%H:%M}"


@dataclass(frozen=True)
class PlanAccess:
    """Weekdays on which a plan works only part of the gym's hours; other days aren't limited."""

    days: Mapping[int, AccessWindow]

    def __post_init__(self) -> None:
        object.__setattr__(self, "days", _frozen_week(self.days))

    @property
    def is_limited(self) -> bool:
        return bool(self.days)

    def summary(self) -> str:
        """Days with the same window together: "Пн, Ср, Пт до 18:00", "Щодня 12:00–18:00".
        Empty when the plan works whenever the gym is open."""
        by_window: dict[AccessWindow, list[int]] = {}
        for day in sorted(self.days):
            by_window.setdefault(self.days[day], []).append(day)
        return "; ".join(
            f"{self._format_days(days)} {window}" for window, days in by_window.items()
        )

    @staticmethod
    def _format_days(days: list[int]) -> str:
        """Sorted weekdays with runs merged: [0, 1, 2, 4] -> "Пн–Ср, Пт"."""
        if len(days) == DAYS_IN_WEEK:
            return "Щодня"
        runs: list[list[int]] = []
        for day in days:
            if runs and runs[-1][-1] == day - 1:
                runs[-1].append(day)
            else:
                runs.append([day])
        return ", ".join(
            WEEKDAY_NAMES[run[0]] + (f"–{WEEKDAY_NAMES[run[-1]]}" if len(run) > 1 else "")
            for run in runs
        )
