import os.path
from itertools import chain
from pprint import pprint

import couchdb
import bottle

from icecrate import ssl
from icecrate import auth
from icecrate import config
from icecrate import db, db_server

APP_ROOT = os.path.dirname(__file__)
BOWER_COMPONENTS = os.path.join(APP_ROOT, "bower_components")
LOCAL_COMPONENTS = os.path.join(APP_ROOT, "local_components")

app = bottle.Bottle()

def user_houses(user_session):
  """Iterator of all houses the logged in user is participating in.

  """
  user_id = user_session.info['email']

  _, resp = db.list("households/participating_in", "by_participants", key=user_id)

  yield from (db[house] for house in chain(resp['member'], resp['guest']))

@app.get("")
@app.get("/")
def static_index():
  return bottle.static_file("index.html",
    root=os.path.join(LOCAL_COMPONENTS, "icecrate-core"))

@app.get("/cache.manifest")
def cache_manifest():
  # this is absolutely off right now.
  # return bottle.static_file("cache.manfest",
  #   root=os.path.join(LOCAL_COMPONENTS, "icecrate-core"))
  pass

@app.get("/static/<src:re:(bower|local)>/<filepath:path>")
def static_files(src, filepath):
  if src == "local":
    root = LOCAL_COMPONENTS
  elif src == "bower":
    root = BOWER_COMPONENTS

  return bottle.static_file(filepath, root=root)

@app.get("/_uuids")
def uuids():
  count = bottle.request.query.get('count', 1)
  uuids = db_server.uuids(count)
  return {
    "type": "uuids",
    "uuids": uuids}

# Pull methods
@app.get("/households")
@auth.require
def list_households(user_session=None):
  return {
    "type": "all_households",
    "households": list(user_houses(user_session))
  }

@app.get("/lists")
@auth.require
def list_shopping(user_session=None):
  houses = list(i.id for i in user_houses(user_session))

  resp = db.view("shopping_lists/by_household", keys=houses)
  lists = list(db[row.id] for row in resp)

  return {
    "type": "all_lists",
    "lists": lists
  }

@app.get("/items")
@auth.require
def list_items(user_session=None):
  houses = list(i.id for i in user_houses(user_session))

  print(houses)
  _, resp = db.list("items/list_items", "by_household", keys=houses)
  print(resp)
  items = list(db[item_id] for item_id in resp['items'])
  print(items)

  return {
    "type": "all_items",
    "items": items
  }

# Push methods
@auth.require
@app.post("/households")
def update_households(user_session=None):
  new_houses = bottle.request.json.get('households')

  response = []
  for house in new_houses:
    # TODO: user auth!
    try:
      # TODO: try not to perform spurious updates
      _id, _rev = db.save(house)
      response.append(dict({"_id": _id, "_rev": _rev, "status": "ok"}))
    except couchdb.http.ResourceConflict:
      response.append({
        "_id": house.get('_id'),
        "_rev": house.get('_rev'),
        "status": "conflict"})

  return {
    "type": "bulk_update_households",
    "data": response
  }

@app.post("/lists")
@auth.require
def update_lists(user_session=None):
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
@auth.require
def update_items(user_session=None):
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

app.mount("/auth/", auth.app)

def main():
  ssl_server = ssl.SSLWSGIRefServer(
    host=config.get("host", "addr"), port=config.get("host", "port"))
  bottle.run(ssl.use_https(app), server=ssl_server)
