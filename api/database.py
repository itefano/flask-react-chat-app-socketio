from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.ext.declarative import declarative_base

import os

dbusr = os.getenv("DATABASE_USER")
dbpwd = os.getenv("DATABASE_PWD")
dbname = os.getenv("DATABASE_NAME")
dbloc = os.getenv("DATABASE_LOCATION")
dbdialect = os.getenv("DATABASE_DIALECT")
engine = create_engine(dbdialect+'://'+dbusr+':'+dbpwd+'@'+dbloc+'/'+dbname)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()
