import json
import urllib.parse
import uuid
from functools import wraps
from collections import namedtuple

import bottle
import requests_oauthlib as oauth

from icecrate import config

app = bottle.Bottle()

oauth_state = None

UserSession = namedtuple("UserSession", "info token")

def require(fn):
  """Requires the user to be signed in to access the resource.

  Returns 401 status if user is not signed in. Inserts a UserSession
  object into kwargs otherwise.

  """

  @wraps(fn)
  def wrapper(*args, **kwargs):
    session_id = bottle.request.get_cookie(
      config.get("session", "cookie_id"),
      secret=config.get("session", "cookie_secret"))

    if session_id is None:
      # not logged in (no cookie)
      bottle.response.status = '401 Unauthorized'
      return

    session = None
    if not kwargs.get('user_session'):
      # Get the session state if we don't have one already.
      session = sessions.user_session(session_id=session_id)

    if session is None:
      # not logged in (no session matching provided ID)
      bottle.response.status = '401 Unauthorized'
      return

    kwargs['user_session'] = session
    print(session_id)
    print(kwargs['user_session'])

    return fn(*args, **kwargs)

  return wrapper


class Sessions:
  def __init__(self):
    self.__sessions = {}

  def user_session(self, session_id):
    return self.__sessions[session_id]

  def make_session(self, *, token=None, session_id=None):
    if token is None:
      if session_id is not None:
        token = self.__sessions[session_id].token
      else:
        return None

    return oauth.OAuth2Session(
      # standard session open
      client_id=config.get("oauth.google", "client_id"),
      token=token)

      # # auto-refreshing access token
      # auto_refresh_url=config.get("oauth.google", "refresh_uri"),
      # auto_refresh_kwargs={
      #   'client_id': config.get("oauth.google", "client_id"),
      #   'client_secret': config.get("oauth.google", "client_secret")},
      # token_updater=self.login)

  def login(self, token):
    client = self.make_session(token=token)

    resp = client.get(config.get("oauth.google", "user_info"))
    info = json.loads(resp.content.decode('utf-8'))

    user = UserSession(info=info, token=token)

    # StackOverflow suggests this isn't very secure for session
    # identifiers, but offered recommendations that use os.urandom(),
    # same as the UUID module's fully random identifiers, such as uuid4.
    # ¯\_('')_/¯
    session_id = uuid.uuid4().hex

    self.__sessions[session_id] = user

    return session_id, user.token['expires_at']

  def logout(self, user_id):
    del self.__sessions[user_id]

sessions = Sessions()

@app.get("/userinfo", name="userinfo")
def userinfo(user_id):
  global sessions
  token = sessions[user_id]

  client = oauth.OAuth2Session(
    client_id=config.get("oauth.google", "client_id"),
    token=token)

  req = client.get(config.get("oauth.google", "user_info"))

  return json.loads(req.content.decode('utf-8'))

@app.get("/login")
def handle_login():
  global oauth_state

  google = oauth.OAuth2Session(
    client_id    = config.get("oauth.google", "client_id"),
    redirect_uri = config.get("oauth.google", "redirect_to"),
    scope        = config.get("oauth.google", "scopes"))

  auth_uri, state = google.authorization_url(
    config.get("oauth.google", "auth_uri"))
    # approval_prompt='force')

  oauth_state = state

  bottle.redirect(auth_uri)

@app.get("/process")
def handle_process():
  global oauth_state

  google = oauth.OAuth2Session(
    client_id=config.get("oauth.google", "client_id"),
    redirect_uri=config.get("oauth.google", "redirect_to"),
    state=oauth_state)

  token = google.fetch_token(
    config.get("oauth.google", "token_uri"),
    client_secret=config.get("oauth.google", "client_secret"),
    code=bottle.request.GET.get('code'))

  session_id, expires = sessions.login(token)

  bottle.response.set_cookie(
    name=config.get("session", "cookie_id"),
    value=session_id,
    secret=config.get("session", "cookie_secret"),
    path="/",
    # httponly=True,
    secure=True,
    expires=expires)

  bottle.redirect("/")
