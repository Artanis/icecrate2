try:
  from icecrate.oauth_cfg import *
except ImportError:
  print("No oauth config found!")

# Server
HOST = 'localhost'
PORT = '8000'

# Database
COUCHDB_SERVER_ADDR = "192.168.0.20"
COUCHDB_SERVER_PORT = "5984"

# Database setup
DB_NAME = 'icecrate'
DB_USER = 'icecrate'
DB_PASS = '2af07ded0ba9e33b4e8bf0ddf13f9c5d7416149c21313e7c0367974cc0497e9e'

# Database admin access (temporary section)
# Used for creating database user, and creating and setting up the
# database
TEMP_ADMIN_USER = 'admin'
TEMP_ADMIN_PASS = 'password'
TEMP_USER_DB    = "_users"
