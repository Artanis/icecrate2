from icecrate import database
from icecrate import config

db_server = database.connect()
db = db_server[config.DB_NAME]
