import couchdb

from icecrate import config

def connect():
  server = couchdb.Server(config.get("database", "netloc"))

  server.resource.credentials = (
    config.get("database", "app_user"),
    config.get("database", "app_passwd"))

  return server

