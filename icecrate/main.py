import os.path

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

@app.get("/static/<filepath:path>")
def static_files(filepath):
  print(os.path.join(STATIC_ROOT, filepath))
  return bottle.static_file(filepath, root=STATIC_ROOT)

@app.get("/_uuids")
def uuids():
  count = bottle.request.query.get('count', 1)
  uuids = db_server.uuids(count)
  print(count, uuids)
  return {
    "type": "uuids",
    "count": count,
    "uuids": uuids}


@app.get("/households")
def list_households():
  pass

@app.get("/households/<household_id>/lists")
def list_shopping(household_id):
  pass

@app.get("/households/<household_id>/items")
def list_items(household_id):
  pass

def main():
  bottle.run(app, host=config.HOST, port=config.PORT)
