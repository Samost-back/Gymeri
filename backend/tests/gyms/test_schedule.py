from datetime import datetime, time

import pytest

from gyms.exceptions import InvalidSchedule
from gyms.schedule import TimeInterval, WeeklySchedule

# 2026-11-16 is a Monday.
MONDAY = datetime(2026, 11, 16)
TUESDAY = datetime(2026, 11, 17)


def interval(opens: str, closes: str) -> TimeInterval:
    return TimeInterval(time.fromisoformat(opens), time.fromisoformat(closes))


def at(day: datetime, clock: str) -> datetime:
    return datetime.combine(day.date(), time.fromisoformat(clock))


def test_unknown_weekday_is_rejected():
    with pytest.raises(InvalidSchedule):
        WeeklySchedule({7: interval("08:00", "21:00")})


def test_schedule_cannot_be_changed_after_creation():
    schedule = WeeklySchedule({0: interval("08:00", "21:00")})

    with pytest.raises(TypeError):
        schedule.days[1] = interval("08:00", "21:00")


@pytest.mark.parametrize(
    ("clock", "expected"),
    [("07:59", False), ("08:00", True), ("21:29", True), ("21:30", False)],
)
def test_is_open_at_respects_bounds(clock, expected):
    schedule = WeeklySchedule({0: interval("08:00", "21:30")})

    assert schedule.is_open_at(at(MONDAY, clock)) is expected


def test_gym_closing_after_midnight_is_open_next_morning():
    schedule = WeeklySchedule({0: interval("18:00", "02:00")})

    assert schedule.is_open_at(at(TUESDAY, "01:30"))
    assert not schedule.is_open_at(at(TUESDAY, "02:30"))


def test_day_without_interval_is_closed():
    schedule = WeeklySchedule({0: interval("08:00", "21:30")})

    assert not schedule.is_open_at(at(TUESDAY, "12:00"))


def test_round_the_clock_needs_all_seven_full_days():
    full_week = {day: interval("00:00", "00:00") for day in range(7)}
    no_sunday = {day: interval("00:00", "00:00") for day in range(6)}

    assert WeeklySchedule(full_week).is_round_the_clock()
    assert not WeeklySchedule(no_sunday).is_round_the_clock()


@pytest.mark.parametrize(
    ("days", "expected"),
    [
        ({}, ""),
        ({d: interval("00:00", "00:00") for d in range(7)}, "Цілодобово"),
        ({d: interval("08:00", "22:00") for d in range(7)}, "Щодня 08:00–22:00"),
        (
            {**{d: interval("08:00", "21:30") for d in range(6)}, 6: interval("09:00", "18:00")},
            "Пн–Сб 08:00–21:30, Нд 09:00–18:00",
        ),
        (
            {**{d: interval("07:30", "21:00") for d in range(5)}, 5: interval("07:30", "20:00")},
            "Пн–Пт 07:30–21:00, Сб 07:30–20:00, Нд вихідний",
        ),
    ],
    ids=["empty", "round the clock", "every day", "sunday differs", "sunday closed"],
)
def test_summary_merges_equal_neighbouring_days(days, expected):
    assert WeeklySchedule(days).summary() == expected
