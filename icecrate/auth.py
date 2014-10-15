import urllib.parse
import uuid

import bottle
import requests_oauthlib as oauth

from icecrate import config

app = bottle.Bottle()

session = {}

@app.get("/login")
def handle_login():
  google = oauth.OAuth2Session(
    client_id    = config.OAUTH_GOOGLE_CLIENT_ID,
    redirect_uri = config.OAUTH_GOOGLE_REDIRECT,
    scope        = config.OAUTH_GOOGLE_SCOPES)

  auth_uri, state = google.authorization_url(
    config.OAUTH_GOOGLE_AUTH_URI,
    approval_prompt='force')

  session['oauth_state'] = state

  bottle.redirect(auth_uri)

@app.get("/process")
def handle_process():
  google = oauth.OAuth2Session(
    client_id    = config.OAUTH_GOOGLE_CLIENT_ID,
    redirect_uri = config.OAUTH_GOOGLE_REDIRECT,
    state =        session['oauth_state'])

  token = google.fetch_token(
    config.OAUTH_GOOGLE_TOKEN_URI,
    client_secret=config.OAUTH_GOOGLE_SECRET,
    code=bottle.request.GET.get('code'))

  req = google.get('https://www.googleapis.com/oauth2/v1/userinfo')

  print(req.content)
