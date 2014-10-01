from icecrate import database
from icecrate import config

database_server = database.connect()
database = database_server[config.DB_NAME]
