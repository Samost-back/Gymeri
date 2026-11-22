from importlib import import_module

# Module names that start with a digit can't be imported with an import statement.
split_address = import_module("gyms.migrations.0004_gym_street_from_address").split_address


def test_address_splits_into_street_and_building():
    assert split_address("просп. Василя Мойсея, 7А") == ("просп. Василя Мойсея", "7А")


def test_address_without_a_comma_is_all_street():
    assert split_address("вул. Конякіна") == ("вул. Конякіна", "")
