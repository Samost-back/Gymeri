import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def clear_throttle_counters():
    # Rate limit counters live in the cache and would carry over from one test to the next.
    cache.clear()
