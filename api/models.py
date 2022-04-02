from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Table, DateTime, func
from sqlalchemy.orm import relationship
from database import Base, engine, db_session


user_group = Table('users_groups', Base.metadata,
                    Column('userId', Integer, ForeignKey('users.id')),
                    Column('groupId', Integer, ForeignKey('groups.id'))
                   )


class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), unique=False, nullable=False)
    # 260 = max path size on windows
    picturePath = Column(String(260), unique=False)
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())
    groupAdmin = Column(Integer, ForeignKey('users.id'))
    users = relationship('User', secondary=user_group, backref='groups', overlaps="usersGroups,groupsUsers")
    messages = relationship('Message')


    def __init__(self, **kwargs):
        super(Group, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Group {self.name!r}>'

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def getusers(self):
        return Group.query.filter(User.groups.any(id=self.id)).all()


class Friend(Base):
    __tablename__ = 'friends'
    id = Column(Integer, primary_key=True)
    userId = Column(Integer, ForeignKey(
        'users.id', name='friend', use_alter=True))
    friendId = Column(Integer, ForeignKey('users.id', name='friends',
                                          use_alter=True))
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())


    def __init__(self, **kwargs):
        super(Friend, self).__init__(**kwargs)

    def __repr__(self):  # for debugging purposes only, yeet it later
        return f'<Friends {self.userId!r} : {self.friendId!r}>'


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    firstName = Column(String(50), unique=False, nullable=False)
    lastName = Column(String(100), unique=False, nullable=False)
    email = Column(String(320), unique=True, nullable=False)
    password = Column(String(120), unique=False, nullable=False)
    gender = Column(String(120), unique=False)
    isAdmin = Column(Boolean, unique=False, default=False)
    # 260 = max path size on windows
    profilePicturePath = Column(String(260), unique=False)
    messages = relationship('Message')
    friend = Column(Integer, ForeignKey('friends.id', name='FK_userFriend'))
    friends = relationship('Friend',
                           primaryjoin="User.friend==Friend.id")
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())


    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)

    def __repr__(self):
        return f'<User {self.firstName!r} {self.lastName!r}>'


class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), unique=False)
    content = Column(Text, unique=False, nullable=False)
    # 260 = max path size on windows
    picturePath = Column(String(260), unique=False)
    author = Column(Integer, ForeignKey('users.id'))
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())
    groupId = Column(Integer, ForeignKey('groups.id'))


    def __init__(self, **kwargs):
        super(Message, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Message {self.title!r} : {self.content!r}>'
