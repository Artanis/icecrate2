import morepath

class app(morepath.App):
  pass

def main():
  config = morepath.setup()
  config.scan()
  config.commit()

  morepath.run(app())
