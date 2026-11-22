"""Demo dataset for the coursework defence: Interatletika gyms in Lutsk plus competitors.

Source: interatletika.lutsk.ua and public listings, November 2026.
Districts are approximate and need checking before the defence.
Coordinates come from OpenStreetMap building matches. Pysarevskoho Street, Lime Fit Club's
address, is now Olimpiiska Street, so its point is Olimpiiska, 3.
"""

from decimal import Decimal

MON_SAT = range(6)
SUNDAY = 6

DISTRICTS = {
    "center": "Центр",
    "33": "33-й мікрорайон",
    "40": "40-й мікрорайон",
    "south": "Південний",
    "lviv-road": "Львівська / ЛНТУ",
    "vidrodzhennia": "Відродження",
}

AMENITIES = {
    "strength": "Силовий зал",
    "pool": "Басейн",
}


def standard_hours(sunday: tuple[str, str] | None) -> dict[int, tuple[str, str]]:
    """Mon-Sat 08:00-21:30 is the usual Interatletika schedule; Sunday varies by gym."""
    hours = dict.fromkeys(MON_SAT, ("08:00", "21:30"))
    if sunday:
        hours[SUNDAY] = sunday
    return hours


def location(latitude: str, longitude: str) -> dict[str, Decimal]:
    return {"latitude": Decimal(latitude), "longitude": Decimal(longitude)}


def plan(
    name: str, price: str, days: int, access: dict[int, tuple[str | None, str | None]] | None = None
) -> dict:
    """`access` maps a weekday to its (starts_at, ends_at) window; None bound = gym hours."""
    return {
        "name": name,
        "price": Decimal(price),
        "duration_days": days,
        "access": access or {},
    }


CHAINS = [
    {
        "slug": "interatletika",
        "name": "Interatletika",
        "short_name": "IA",
        "description": "Мережа тренажерних залів у Луцьку з єдиним абонементом у всі зали.",
        # Their site, interatletika.lutsk.ua, serves a certificate for another domain, so
        # browsers refuse it; Instagram is the working link until they fix it. The empty
        # website is explicit, so reseeding clears the old link from existing databases.
        "website": "",
        "instagram_url": "https://www.instagram.com/interatletika.lutsk/",
        "plans": [
            plan("Місячний тест-драйв для новачків", "850", 30),
            plan(
                "Студентський / шкільний безліміт на місяць",
                "800",
                30,
                access=dict.fromkeys((0, 2, 4), (None, "18:00")),
            ),
            plan("Повний безліміт на місяць у всі зали", "1350", 30),
            plan("Безліміт на місяць у всі зали + басейн", "1750", 30),
            plan(
                "Денний абонемент на 3 місяці",
                "1900",
                90,
                access=dict.fromkeys(range(7), ("12:00", "18:00")),
            ),
            plan("Ветеранський безліміт на 3 місяці", "1500", 90),
            plan("Річний безліміт", "11800", 365),
            plan("Річний безліміт + басейн", "14600", 365),
        ],
        "gyms": [
            {
                "slug": "interatletika-yaremchuka",
                "name": "Interatletika на Яремчука",
                "highlight": "ТЦ «Глобус»",
                "address": "вул. Назарія Яремчука, 11",
                **location("50.769619", "25.370824"),
                "district": "40",
                "phone": "+380990888031",
                "amenities": ["strength"],
                "hours": standard_hours(sunday=("09:00", "18:00")),
            },
            {
                "slug": "interatletika-koniakina",
                "name": "Interatletika на Конякіна",
                "address": "вул. Конякіна, 14",
                **location("50.774899", "25.361431"),
                "district": "33",
                "phone": "+380332719793",
                "amenities": ["strength"],
                "hours": standard_hours(sunday=("09:00", "18:00")),
            },
            {
                "slug": "interatletika-dubnivska",
                "name": "Interatletika на Дубнівській",
                "address": "вул. Дубнівська, 15",
                **location("50.741603", "25.359210"),
                "district": "south",
                "phone": "+380990888192",
                "amenities": ["strength"],
                "hours": standard_hours(sunday=("09:00", "18:00")),
            },
            {
                "slug": "interatletika-lvivska",
                "name": "Interatletika на Львівській",
                "highlight": "Спорткомплекс ЛНТУ · басейн",
                "address": "вул. Львівська, 75",
                **location("50.725652", "25.297581"),
                "district": "lviv-road",
                "phone": "+380950935260",
                "amenities": ["strength", "pool"],
                "hours": {
                    **dict.fromkeys(range(5), ("07:30", "21:00")),
                    5: ("07:30", "20:00"),
                },
            },
            {
                "slug": "interatletika-voli",
                "name": "Interatletika на Волі",
                "highlight": "ТЦ «Гранд Волинь»",
                "address": "просп. Волі, 42",
                **location("50.745126", "25.339579"),
                "district": "center",
                "phone": "+380994052626",
                "amenities": ["strength"],
                "hours": standard_hours(sunday=("10:00", "20:00")),
            },
            {
                # Hidden until its phone and schedule are confirmed.
                "slug": "interatletika-sobornosti",
                "name": "Interatletika на Соборності",
                "address": "просп. Соборності, 30",
                **location("50.759921", "25.362440"),
                "district": "33",
                "amenities": ["strength"],
                "is_published": False,
            },
        ],
    },
    # Prices and hours of Lime Fit Club and Sport Life are placeholders for the demo:
    # they are not published anywhere, so call the clubs and replace them before the defence.
    {
        "slug": "lime-fit-club",
        "name": "Lime Fit Club",
        "short_name": "LF",
        "description": "Фітнес-клуб у центрі Луцька: тренажерний зал, басейн і групові заняття.",
        "plans": [
            plan("Разове відвідування", "250", 1),
            plan("Безліміт на місяць", "1500", 30),
            plan(
                "Ранковий абонемент на місяць",
                "1100",
                30,
                access=dict.fromkeys(range(7), (None, "14:00")),
            ),
            plan("Безліміт на 3 місяці", "3900", 90),
            plan("Річний безліміт", "12900", 365),
        ],
        "gyms": [
            {
                "slug": "lime-fit-club-pysarevskoho",
                "name": "Lime Fit Club",
                "address": "вул. Писаревського, 3",
                **location("50.759336", "25.380439"),
                "district": "center",
                "phone": "+380670000325",
                "amenities": ["strength", "pool"],
                "hours": {
                    **dict.fromkeys(range(5), ("07:00", "22:00")),
                    5: ("09:00", "20:00"),
                    6: ("09:00", "20:00"),
                },
            },
        ],
    },
    # Other competitors: hidden until their schedules and prices are collected.
    {
        "slug": "mojo-fitness",
        "name": "MOJO FITNESS",
        "instagram_url": "https://www.instagram.com/mojofitness_lutsk/",
        "gyms": [
            {
                "slug": "mojo-fitness-kovelska",
                "name": "MOJO FITNESS",
                "address": "вул. Ковельська, 16",
                **location("50.742592", "25.314395"),
                "district": "center",
                "phone": "+380633292886",
                "amenities": ["strength"],
                "is_published": False,
            },
        ],
    },
    {
        "slug": "gravity-space",
        "name": "Gravity Space",
        "gyms": [
            {
                "slug": "gravity-space-lesi-ukrainky",
                "name": "Gravity Space",
                "address": "вул. Лесі Українки, 52",
                **location("50.745284", "25.323897"),
                "district": "center",
                "phone": "+380967759988",
                "amenities": ["strength"],
                "is_published": False,
            },
        ],
    },
    {
        "slug": "sport-life",
        "name": "Sport Life",
        "short_name": "SL",
        "description": "Всеукраїнська мережа фітнес-клубів; у Луцьку з аквазоною на три басейни.",
        "website": "https://sportlife.ua/uk/clubs/lutsk/",
        "plans": [
            plan("Гостьовий візит", "350", 1),
            plan("Безліміт на місяць", "1900", 30),
            plan(
                "Денний абонемент на місяць",
                "1400",
                30,
                access=dict.fromkeys(range(7), (None, "17:00")),
            ),
            plan("Безліміт на 6 місяців", "8900", 180),
            plan("Річний безліміт", "15900", 365),
        ],
        "gyms": [
            {
                "slug": "sport-life-moiseia",
                "name": "Sport Life",
                "address": "просп. Василя Мойсея, 7А",
                **location("50.753962", "25.337427"),
                "district": "center",
                "phone": "+380332280493",
                "highlight": "Аквазона · три басейни",
                "amenities": ["strength", "pool"],
                "hours": {
                    **dict.fromkeys(range(5), ("07:00", "22:00")),
                    5: ("08:00", "21:00"),
                    6: ("09:00", "20:00"),
                },
            },
        ],
    },
    {
        "slug": "maximus",
        "name": "Maximus",
        "instagram_url": "https://www.instagram.com/maximus_club_lutsk/",
        "gyms": [
            {
                "slug": "maximus-elektroaparatna",
                "name": "Maximus",
                "address": "вул. Електроапаратна, 4",
                **location("50.739928", "25.378323"),
                "district": "vidrodzhennia",
                "phone": "+380664669626",
                "amenities": ["strength", "pool"],
                "is_published": False,
            },
        ],
    },
]
