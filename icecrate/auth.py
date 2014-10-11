import urllib.parse
import uuid

import bottle
import openid
from openid.consumer.consumer import Consumer, DiscoveryFailure
from openid.extensions import pape, sreg

from icecrate import config

app = bottle.Bottle()

if config.OPENID_STATELESS:
  from openid.store.memstore import MemoryStore
  store = MemoryStore()
else:
  store = None

sessions = {}

def base_url():
  urlparts = bottle.request.urlparts
  baseparts = (urlparts.scheme, urlparts.netloc, "", "", "", "")
  return urllib.parse.urlunparse(baseparts)

def verify(return_to=None):
  pass

def user_session():
  session_id = bottle.request.cookies.get(config.OPENID_COOKIE_NAME)

  if session_id:
    # retrieve session
    session = sessions.get(session_id)
  else:
    # make session
    # StackOverflow suggests this isn't very secure for session
    # identifiers, but offered recommendations that use os.urandom(),
    # same as the UUID module's fully random identifiers. ¯\_('')_/¯
    session_id = str(uuid.uuid4())
    sessions[session_id] = {}
    sessions[session_id]['id'] = session_id

  return sessions.get(session_id)

@app.post("/verify")
def handle_verify():
  """Begin user authentication with OpenID indentifying party.

  """
  global store

  openid_req = bottle.request.json.get('openid')
  openid_url = openid_req.get('url')

  consumer = Consumer(user_session(), store)

  try:
    request = consumer.begin(openid_url)
  except DiscoveryFailure as e:
    # TODO: Error handling!
    raise

  if request:
    # Add data requests for email, nickname and possibly full name.
    request.addExtension(sreg.SRegRequest(
      required=['email'], optional=['nickname', 'fullname']))
    # Add phishing resistant
    request.addExtension(pape.Request([pape.AUTH_PHISHING_RESISTANT]))

    trust_root = base_url()
    return_to = app.get_url("process")

    print("redirecting!")
    redirection = request.redirectURL(
      trust_root, return_to, immediate=config.OPENID_IMMEDIATE_MODE)
    return redirection
  else:
    print("no service found for {0}!".format(openid_url))

@app.post("/process", name="process")
def handle_process():
  consumer = Consumer(user_session(), store)

  url = 'http://{0}/{1}'.format(
    bottle.request.headers.get('Host'),
    bottle.request.path)
  info = consumer.complete(bottle.request.query_string, url)

  sreg_resp = None
  pape_resp = None
  display_id = info.getDisplayIdentifier()

  print(info)
