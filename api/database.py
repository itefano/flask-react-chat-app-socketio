import os
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from dotenv import load_dotenv
load_dotenv()
# import seed_db

dbusr = os.getenv("DATABASE_USER")
dbpwd = os.getenv("DATABASE_PWD")
dbname = os.getenv("DATABASE_NAME")
dbloc = os.getenv("DATABASE_LOCATION")
dbdialect = os.getenv("DATABASE_DIALECT")

engine = create_engine(dbdialect+'://'+dbusr+':'+dbpwd+'@'+dbloc+'/'+dbname)


if not database_exists(engine.url):
    create_database(engine.url)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()
