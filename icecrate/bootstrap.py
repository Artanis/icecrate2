"""Bootstrap a new icecrate2 install to functionality.

Installs bower dependencies, creates couchdb database and loads the
icecrate design document.

"""
import os
import os.path
from getpass import getpass
from distutils.spawn import spawn

import couchdb

from icecrate import config

def database_setup():
  """Bootstrap CouchDB Database.

  Requires couchdb admin.

  1. Creates a new user (default: icecrate).
  2. Creates the app database (default: icecrate).
  3. Sets up the _security object (only admin and
     icecrate can access).

  """
  admin_user = input("CouchDB Admin (blank for admin party): ")
  admin_pass = getpass("Password (blank for admin party): ")

  # It's uncommon, but this can be changed.
  user_db_name = input("CouchDB users database (_users): ")
  if not user_db_name:
    user_db_name = "_users"

  server = couchdb.Server(config.get("database", "netloc"))

  # We might be in Admin Party mode.
  if admin_user:
    # Sign in with admin.
    server.resource.credentials = (admin_user, admin_pass)

  # App user
  usersdb = server[user_db_name]

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

def bower_setup():
  """Fetches Bower dependencies.

  Dependencies are specified in bower.json.

  """
  os.chdir(os.path.dirname(__file__))
  spawn(['bower', 'install'])

def design_docs_setup():
  """Pushes the CouchDB design docs to the database.

  These documents are required.

  """
  os.chdir(os.path.join(os.path.dirname(__file__), "couchdb_design"))
  spawn(['couchapp', 'push', '.', config.get('database', 'couchapp_dest')])

def main():
    database_setup()
    design_docs_setup()
    bower_setup()
