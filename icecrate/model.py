import json
import os.path

from icecrate.main import app
from icecrate import database_server, database

TEST_DATA_PATH = os.path.join(os.path.dirname(__file__), "_static", "data", "dummy")
TEST_DATA_ITEMS = os.path.join(TEST_DATA_PATH, "items.json")
TEST_DATA_HOUSEHOLDS = os.path.join(TEST_DATA_PATH, "households.json")
TEST_DATA_SHOPPING = os.path.join(TEST_DATA_PATH, "shopping.json")

class UUID:
  def uuids(self, count):
    return database_server.uuids(count)

class HouseholdCollection:
  def __init__(self):
    self.households = []

    # TODO: Add authentication!
    with open(TEST_DATA_HOUSEHOLDS, "r") as json_houses:
      households = json.load(json_houses)
    self.households = households

class ShoppingListCollection:
  def __init__(self, household_id):
    self.household_id = household_id
    self.lists = []

    with open(TEST_DATA_SHOPPING, "r") as json_lists:
      lists = json.load(lists)

    for l in lists:
      if l.get('household') == household_id:
        self.lists.append(l)

class ItemCollection:
  def __init__(self, household_id):
    self.household_id = household_id
    self.items = []

    # read test data
    # this will be replaced with a CouchDB view filtering on
    # household_id, so the for-loop below will become a simple
    # assignment.
    with open(TEST_DATA_ITEMS, "r") as json_items:
      items = json.load(json_items)
    for item in items:
      if item.get('household') == household_id:
        self.items.append(item)
