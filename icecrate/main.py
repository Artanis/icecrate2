import os.path
from pprint import pprint

import couchdb
import bottle

from icecrate import config
from icecrate import db, db_server

APP_ROOT = os.path.dirname(__file__)
STATIC_ROOT = os.path.join(APP_ROOT, "_static")

app = bottle.Bottle()

@app.get("")
@app.get("/")
def static_index():
  return bottle.static_file("index.html", root=STATIC_ROOT)

@app.get("/cache.manifest")
def cache_manifest():
  # this is absolutely off right now.
  pass

@app.get("/static/<filepath:path>")
def static_files(filepath):
  return bottle.static_file(filepath, root=STATIC_ROOT)

@app.get("/_uuids")
def uuids():
  count = bottle.request.query.get('count', 1)
  uuids = db_server.uuids(count)
  return {
    "type": "uuids",
    "uuids": uuids}


# Pull methods
@app.get("/households")
def list_households():
  # TODO: User auth!
  houses = []
  for row in db.view('_all_docs'):
    # TODO: Replace with CouchDB view, this line is SLOW
    house = db[row.id]
    if house['type'] == 'household':
      houses.append(dict(house))

  return {
    "type": "all_households",
    "households": houses
  }

@app.get("/lists")
def list_shopping():
  # TODO: User auth!
  lists = []
  for row in db.view('_all_docs'):
    # TODO: Replace with CouchDB view, this line is SLOW
    l = db[row.id]
    if l['type'] == 'shopping-list':
      lists.append(dict(l))

  return {
    "type": "all_lists",
    "lists": lists
  }

@app.get("/items")
def list_items():
  # TODO: User auth!
  items = []
  for row in db.view('_all_docs'):
    # TODO: Replace with CouchDB view, this line is SLOW
    item = db[row.id]
    if item['type'] == 'item':
      items.append(dict(item))

  return {
    "type": "all_items",
    "items": items
  }

# Push methods
@app.post("/households")
def update_households():
  new_houses = bottle.request.json.get('households')

  response = []
  for house in new_houses:
    # TODO: user auth!
    try:
      # TODO: try not to perform spurious updates
      _id, _rev = db.save(house)
      response.append(dict({"_id": _id, "_rev": _rev, "status": "ok"}))
    except couchdb.http.ResourceConflict:
      dict({"_id": house['_id'], "_rev": house['_rev'], "status": "conflict"})
      response.append(dict({"_id": house['_id'], "_rev": house['_rev'], "status": "conflict"}))

  return {
    "type": "bulk_update_households",
    "data": response
  }

@app.post("/lists")
def update_lists():
  new_lists = bottle.request.json.get('lists')

  response = []
  for l in new_lists:
    # TODO: user auth!
    try:
      # TODO: try not to perform spurious updates
      _id, _rev = db.save(l)
      response.append(dict({"_id": _id, "_rev": _rev, "status": "ok"}))
    except couchdb.http.ResourceConflict:
      dict({"_id": l['_id'], "_rev": l['_rev'], "status": "conflict"})
      response.append(dict({"_id": l['_id'], "_rev": l['_rev'], "status": "conflict"}))

  return {
    "type": "bulk_update_lists",
    "data": response
  }

@app.post("/items")
def update_items():
  new_items = bottle.request.json.get('items')
  # pprint(new_items)

  response = []
  for item in new_items:
    # TODO: user auth!
    try:
      # TODO: try not to perform spurious updates
      _id, _rev = db.save(item)
      response.append(dict({"_id": _id, "_rev": _rev, "status": "ok"}))
    except couchdb.http.ResourceConflict:
      dict({"_id": item['_id'], "_rev": item['_rev'], "status": "conflict"})
      response.append(dict({"_id": item['_id'], "_rev": item['_rev'], "status": "conflict"}))

  return {
    "type": "bulk_update_items",
    "data": response
  }

def main():
  bottle.run(app, host=config.HOST, port=config.PORT)
