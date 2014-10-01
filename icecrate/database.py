import couchdb

from icecrate import config

# bleh. dunno if security hole.
# TODO: Find a better way.
server_url = "http://{addr}:{port}/".format(
  addr=config.COUCHDB_SERVER_ADDR,
  port=config.COUCHDB_SERVER_PORT)

def setup_db():
  # if these don't exist, we're not setting up the database, no matter
  # the current state.
  if not all([config.TEMP_USER_DB, config.TEMP_ADMIN_USER, config.TEMP_ADMIN_PASS]):
    return

  server = couchdb.Server(server_url)
  print("WARNING: using admin credentials!")
  server.resource.credentials = (
    config.TEMP_ADMIN_USER, config.TEMP_ADMIN_PASS)

  # setting up database user
  usersdb = server[config.TEMP_USER_DB]

  user_id = "org.couchdb.user:{user}".format(user=config.DB_USER)

  print("checking database user...", end="")
  if user_id not in usersdb:
    usersdb.save({
      "_id": user_id,
      "type": "user",
      "name": config.DB_USER,
      "password": config.DB_PASS,
      "roles": []})
  print(" ok.")

  # setting up database
  print("checking database...", end="")
  if config.DB_NAME not in server:
    server.create(config.DB_NAME)

  appdb = server[config.DB_NAME]
  print(" ok.")


  print("checking _security object...", end="")
  security = appdb.security
  security_is_dirty = False

  if "admins" not in security:
    security['admins'] = {}
    security_is_dirty = True

  if "names" not in security.get("admins"):
    security['admins']['names'] = []
    security_is_dirty = True

  if config.DB_USER not in security['admins']['names']:
    security['admins']['names'].append(config.DB_USER)
    security_is_dirty = True


  if "roles" not in security.get("admins"):
    security['admins']['roles'] = ["admins"]
    _security_is_dirty = True

  if security_is_dirty:
    appdb.security = security

  print(" ok.")

  # TODO: make sure these are removed from config files
  # (when they are put there).
  del config.TEMP_USER_DB
  del config.TEMP_ADMIN_USER
  del config.TEMP_ADMIN_PASS

def connect():
  setup_db()
  server = couchdb.Server(server_url)
  server.resource.credentials = (config.DB_USER, config.DB_PASS)

  return server
