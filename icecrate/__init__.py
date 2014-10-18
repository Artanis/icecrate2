import os.path
import configparser

from xdg import BaseDirectory as xdg

config = configparser.ConfigParser()

config.read([
  os.path.join(os.path.dirname(__file__), "defaults.ini"),
  os.path.join(os.sep, "ect", "icecrate", "config.ini"),
  os.path.join(xdg.save_config_path("icecrate"), "config.ini"),
])

from icecrate import database

db_server = database.connect()
import sys

db = db_server[config.get("database", "app_db")]
