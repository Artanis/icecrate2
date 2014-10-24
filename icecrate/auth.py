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

UserSession = namedtuple("UserSession", "id info token")

def require(fn):
  """Requires the user to be signed in to access the resource.

  Returns 401 status if user is not signed in. Inserts a UserSession
  object into kwargs otherwise.

  """

  @wraps(fn)
  def wrapper(*args, **kwargs):
    session_id = bottle.request.get_cookie(
      config.get("session", "session_id"),
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
      bottle.redirect("/")
      return

    kwargs['user_session'] = session

    return fn(*args, **kwargs)

  return wrapper


class Sessions:
  def __init__(self):
    self.__sessions = {}

  def user_session(self, session_id):
    return self.__sessions.get(session_id)

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


    # StackOverflow suggests UUIDs aren't very secure for session
    # identifiers, but offered recommendations that use os.urandom(),
    # same as the UUID module's fully random identifiers, such as uuid4.
    # ¯\_('')_/¯
    new_session = UserSession(id=uuid.uuid4().hex, info=info, token=token)

    self.__sessions[new_session.id] = new_session

    # Session ID for server-side authentication
    bottle.response.set_cookie(
      name=config.get("session", "session_id"),
      value=new_session.id,
      secret=config.get("session", "cookie_secret"),
      path="/",
      httponly=True,
      secure=True,
      expires=new_session.token['expires_at'])

    return

  def logout(self, user_session):
    del self.__sessions[user_session.id]

sessions = Sessions()

@app.get("/info", name="userinfo")
@require
def userinfo(user_session=None):
  return {
    "nickname": user_session.info.get('nickname'),
    "name": user_session.info.get('name'),
    "email": user_session.info.get('email')}

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

@app.get("/logout")
@require
def handle_logout(user_session=None):
  sessions.logout(user_session)
  bottle.redirect("/")

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

  sessions.login(token)

  bottle.redirect("/")
