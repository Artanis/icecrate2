from icecrate.main import app
from icecrate.model import UUID
from icecrate.model import HouseholdCollection
from icecrate.model import ShoppingListCollection
from icecrate.model import ItemCollection

@app.json(model=UUID)
def uuids_default(self, request):
  return self.uuids(request.GET.get('count'))

# Collections
# Households
@app.json(model=HouseholdCollection)
def households_default(self, request):
  return {
    "type": 'user_households',
    "households": self.households
  }

@app.json(model=HouseholdCollection, request_method="POST")
def household_create(self, request):
  pass

# Shopping lists
@app.json(model=ShoppingListCollection)
def shoppinglists_default(self, request):
  return {
    "type": "shoppinglists_by_household",
    "household_id": self.household_id,
    "lists": self.lists
  }

@app.json(model=ShoppingListCollection, request_method="POST")
def shoppinglist_create(self, request):
  pass

# Items
@app.json(model=ItemCollection)
def items_default(self, request):
  return {
    'type': 'items_by_household',
    'household_id': self.household_id,
    'items': self.items
  }

@app.json(model=ItemCollection, request_method="POST")
def item_create(self, request):
  pass
