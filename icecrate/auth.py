import json
import urllib.parse
import uuid
from collections import namedtuple

import bottle
import requests_oauthlib as oauth

from icecrate import config

app = bottle.Bottle()

oauth_state = None

UserSession = namedtuple("UserSession", "info token")

class Sessions:
  def __init__(self):
    self.__sessions = {}

  def user_session(self, *, token=None, user_id=None):
    if token is None and user_id is not None:
      token = self.__sessions[user_id]['token']

    return oauth.OAuth2Session(
      # standard session open
      client_id=config.get("oauth.google", "client_id"),
      token=token,

      # auto-refreshing access token
      auto_refresh_url=config.get("oauth.google", "refresh_uri"),
      auto_refresh_kwargs={
        'client_id': config.get("oauth.google", "client_id"),
        'client_secret': config.get("oauth.google", "client_secret")},
      token_updater=self.login)

  def user_info(self, *, client=None, user_id=None):
    resp = client.get(config.get("oauth.google", "user_info"))
    return json.loads(resp.content.decode('utf-8'))

  def login(self, token):
    client = self.user_session(token=token)

    info = self.user_info(client=client)

    user = UserSession(info=info, token=token)

    self.__sessions[user.info['id']] = user

    return user

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
    config.get("oauth.google", "auth_uri"),
    approval_prompt='force')

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

  user = sessions.login(token)

  bottle.response.set_cookie(
    name=config.get("session", "cookie_id"),
    value=user.info['id'],
    secret=config.get("session", "cookie_secret"),
    path="/",
    # httponly=True,
    secure=True,
    expires=user.token['expires_at'])

  bottle.redirect("/")
