
from database import Base, engine
import models

def dropdb():
    Base.metadata.drop_all(bind=engine)

dropdb()