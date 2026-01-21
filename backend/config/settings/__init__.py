"""
Settings package for VIDA project.
Default to development settings.
"""

import os

environment = os.environ.get("DJANGO_ENV", "development")

if environment == "production":
    from .production import *
else:
    from .development import *
