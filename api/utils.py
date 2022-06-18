from database import db_session
from flask_jwt_extended import get_jwt_identity

import models


def get_user(id):
    s = db_session()
    q = s.query(models.User).get(id)
    return q


def get_email():
    s = db_session()
    q = s.query(models.User).get(get_jwt_identity())
    s.close()
    if q:
        if q.email:
            return q.email
    return None  # not needed but pretty
    

def isEmail(email):
    import re
    return re.fullmatch(re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+'), email)


def isSafe(pwd):
    """Checks if password is safe
    Checks : 
        - If it has at least 8 chars
        - If it is not a string of numbers
    Doesn't check for more bc salting, and also, I'm too lazy"""
    return len(pwd)>7 and not pwd.isdigit() and any(char.isdigit() for char in pwd)

