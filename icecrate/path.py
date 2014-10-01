from icecrate.main import app
from icecrate.model import UUID
from icecrate.model import HouseholdCollection
from icecrate.model import ShoppingListCollection
from icecrate.model import ItemCollection

@app.path(model=UUID, path="/_uuids")
def get_uuids():
  return UUID()

@app.path(model=HouseholdCollection, path="/households")
def get_user_households():
  # TODO: User authentication!
  return HouseholdCollection()

@app.path(model=ShoppingListCollection, path="/households/{household_id}/lists")
def get_shopping_lists_by_household(household_id):
  return ShoppingListCollection(household_id)

@app.path(model=ItemCollection, path="/households/{household_id}/items")
def get_items_by_household(household_id):
  return ItemCollection(household_id)
