import os.path
import configparser

import couchdb
from xdg import BaseDirectory as xdg

config = configparser.ConfigParser()

config.read([
  os.path.join(os.path.dirname(__file__), "defaults.ini"),
  os.path.join(os.sep, "ect", "icecrate", "config.ini"),
  os.path.join(xdg.save_config_path("icecrate"), "config.ini"),
])

from icecrate import database


try:
    db_server = database.connect()
    db = db_server[config.get("database", "app_db")]
except couchdb.http.Unauthorized:
    print("CouchDB rejected {} user: Credentials incorrect.".
        format(config.get("database", "app_user")))
    
    db_server = None
    db = None
