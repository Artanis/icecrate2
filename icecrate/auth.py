import json
import urllib.parse
import uuid

import bottle
import requests_oauthlib as oauth

from icecrate import config

app = bottle.Bottle()

oauth_state = None

def Sessions:
class Sessions:
  def __init__(self):
    self.__sessions = {}

  def user_session(self, *, token=None, user_id=None):
    if token is None and user_id is not None:
      token = self.__sessions[user_id]['token']

    return oauth.OAuth2Session(
      # standard session open
      client_id=config.OAUTH_GOOGLE_CLIENT_ID,
      token=token,

      # auto-refreshing access token
      auto_refresh_url=config.OAUTH_GOOGLE_REFRESH_URI,
      auto_refresh_kwargs={
        'client_id': config.OAUTH_GOOGLE_CLIENT_ID,
        'client_secret': config.OAUTH_GOOGLE_SECRET},
      token_updater=self.login)

  def user_info(self, *, client=None, user_id=None):
    resp = client.get(config.GOOGLE_USER_INFO_URI)
    return json.loads(resp.content.decode('utf-8'))

  def login(self, token):
    client = self.user_session(token)

    info = self.user_info(client)

    user = {
      'token': token,
      'info': info}

    self.__sessions[info['id']] = user

  def logout(self, user_id):
    del self.__sessions[user_id]

sessions = Sessions()

@app.get("/userinfo/<user_id>", name="userinfo")
def userinfo(user_id):
  global sessions
  token = sessions[user_id]

  client = oauth.OAuth2Session(
    client_id=config.OAUTH_GOOGLE_CLIENT_ID,
    token=token)

  req = client.get(config.GOOGLE_USER_INFO_URI)

  return json.loads(req.content.decode('utf-8'))

@app.get("/login")
def handle_login():
  global oauth_state

  google = oauth.OAuth2Session(
    client_id    = config.OAUTH_GOOGLE_CLIENT_ID,
    redirect_uri = config.OAUTH_GOOGLE_REDIRECT,
    scope        = config.OAUTH_GOOGLE_SCOPES)

  auth_uri, state = google.authorization_url(
    config.OAUTH_GOOGLE_AUTH_URI,
    approval_prompt='force')

  oauth_state = state

  bottle.redirect(auth_uri)

@app.get("/process")
def handle_process():
  global oauth_state

  google = oauth.OAuth2Session(
    client_id=config.OAUTH_GOOGLE_CLIENT_ID,
    redirect_uri=config.OAUTH_GOOGLE_REDIRECT,
    state=oauth_state)

  token = google.fetch_token(
    config.OAUTH_GOOGLE_TOKEN_URI,
    client_secret=config.OAUTH_GOOGLE_SECRET,
    code=bottle.request.GET.get('code'))

  sessions.login(token)

  req = google.get(config.GOOGLE_USER_INFO_URI)

  userinfo = json.loads(req.content.decode('utf-8'))

  bottle.redirect("/")
  # bottle.redirect(app.get_url("userinfo", user_id=userinfo['id']))
