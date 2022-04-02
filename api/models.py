from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    firstName = Column(String(50), unique=False)
    lastName = Column(String(100), unique=False)
    email = Column(String(320), unique=True)
    password = Column(String(120), unique=False)
    isAdmin = Column(Boolean, unique=False)
    profilePicturePath = Column(String(260), unique=False)#260 = max path size on windows

    def __init__(self, name=None, email=None):
        self.name = name
        self.email = email

    def __repr__(self):
        return f'<User {self.name!r}>'