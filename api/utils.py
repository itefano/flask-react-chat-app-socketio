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

def get_notifications():
    s = db_session()
    q = s.query(models.User).join(models.Message_Seen).where(
        models.Message_Seen.seen == False).count()
    if not q:
        q = 0
    return q
