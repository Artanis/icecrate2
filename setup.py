from setuptools import setup, find_packages

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
    "morepath",
    "couchdb"
  ],
  entry_points={
    'console_scripts': [
      'icecrate-start = icecrate.main:main'
    ]
  }
)
