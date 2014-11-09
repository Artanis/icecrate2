from setuptools import setup, find_packages

from setuptools.command.install import install as _install

post_install_msg = (
"""
=======================================================================
!!                            Important                              !!
=======================================================================
To finish installing Icecrate, you will also need Bower and CouchApp.

Bower is a node utility, use `npm install bower` to get it. CouchApp is
currently a Python 2 package and can't be run with the same interpreter
as Icecrate. Until CouchApp supports Python 3, it will need to be
provided externally.

Once both Bower and CouchApp are installed, run `icecrate-bootstrap`,
which will setup the database and download the Bower dependencies.
=======================================================================

""")

class install(_install):
  def run(self):
    _install.run(self)
    print(post_install_msg)

setup(name="icecrate2",
  version="0.3.0",
  description="A slightly less-simple home inventory system.",
  author="Erik Youngren",
  author_email="artanis00+icecrate@gmail.com",
  url="https://github.com/Artanis/icecrate2",
  packages=find_packages(),
  include_package_data=True,
  zip_safe=False,
  install_requires=[
    "bottle",
    "pyxdg",
    "couchdb",
    "requests",
    "requests-oauthlib"
  ],
  entry_points={
    'console_scripts': [
      'icecrate-bootstrap = icecrate.bootstrap:main',
      'icecrate-start = icecrate.main:main'
    ]
  },
  cmdclass={'install': install}
)
