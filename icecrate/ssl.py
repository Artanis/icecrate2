from bottle import ServerAdapter

from icecrate import config

# copied from bottle. Only changes are to import ssl and wrap the socket
class SSLWSGIRefServer(ServerAdapter):
  """http://www.socouldanyone.com/2014/01/bottle-with-ssl.html

  """
  def run(self, handler):
    from wsgiref.simple_server import make_server, WSGIRequestHandler
    import ssl

    if self.quiet:
      class QuietHandler(WSGIRequestHandler):
        def log_request(*args, **kw): pass
      self.options['handler_class'] = QuietHandler

    srv = make_server(self.host, self.port, handler, **self.options)
    srv.socket = ssl.wrap_socket (
     srv.socket,
     certfile=config.get("https", "certificate"),  # path to certificate
     server_side=True)
    srv.serve_forever()

def use_https(app):
  """https://github.com/defnull/bottle/issues/347#issuecomment-6575466

  """
  def https_app(environ, start_response):
    environ['wsgi.url_scheme'] = 'https'
    return app(environ, start_response)
  return https_app
