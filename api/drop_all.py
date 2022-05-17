
from database import Base, engine

def dropdb():
    Base.metadata.drop_all(bind=engine)

dropdb()