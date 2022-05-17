from database import Base, engine

def initdb():
    import models
    Base.metadata.create_all(bind=engine)


initdb()
