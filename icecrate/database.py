import couchdb

from icecrate import config

# bleh. dunno if security hole.
# TODO: Find a better way.
server_url = "http://{addr}:{port}/".format(
  addr=config.get("database", "addr"),
  port=config.get("database", "port"))

def setup_db():
  # TODO: make this an entry point dedicated to app setup.

  # if these don't exist, we're not setting up the database, no matter
  # the current state._db
  expected_fields = ("user", "passwd", "users_db")
  present_fields = tuple(config["database.admin"].keys())
  if not all((field in present_fields) for field in expected_fields):
    return

  server = couchdb.Server(server_url)
  print("WARNING: using admin credentials!")
  server.resource.credentials = (
    config.get("database.admin", "user"),
    config.get("database.admin", "passwd"))

  # setting up database user
  usersdb = server[config.get("database.admin", "users_db")]

  user_id = "org.couchdb.user:{user}".format(user=config.get("database", "app_user"))

  print("checking database user... ", end="")
  if user_id not in usersdb:
    print("missing.\ncreating database user... ", end="")
    usersdb.save({
      "_id": user_id,
      "type": "user",
      "name": config.get("database", "app_user"),
      "password": config.get("database", "app_passwd"),
      "roles": []})
  print("ok.")

  # setting up database
  print("checking database... ", end="")
  if config.get("database", "app_db") not in server:
    print("missing.\ncreating database... ", end="")
    server.create(config.get("database", "app_db"))

  appdb = server[config.get("database", "app_db")]
  print("ok.")


  print("checking _security object... ", end="")
  security = appdb.security
  security_is_dirty = False

  if "admins" not in security:
    print("empty.\nsetting up _security... ", end="")
    security['admins'] = {}
    security_is_dirty = True

  if "names" not in security.get("admins"):
    security['admins']['names'] = []
    security_is_dirty = True

  if config.get("database", "app_user") not in security['admins']['names']:
    security['admins']['names'].append(config.get("database", "app_user"))
    security_is_dirty = True

  if "roles" not in security.get("admins"):
    security['admins']['roles'] = ["admins"]
    _security_is_dirty = True

  if security_is_dirty:
    appdb.security = security

  print("ok.")

def connect():
  setup_db()
  server = couchdb.Server(server_url)
  server.resource.credentials = (
    config.get("database", "app_user"),
    config.get("database", "app_passwd"))

  return server
