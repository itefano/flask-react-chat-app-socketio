from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Table, DateTime, func
from sqlalchemy.orm import relationship
from database import Base, engine, db_session


user_group = Table('users_groups', Base.metadata,
                   Column('userId', Integer, ForeignKey('users.id')),
                   Column('groupId', Integer, ForeignKey('groups.id')),
                   Column('time_created', DateTime(
                       timezone=True), default=func.now()),
                   Column('time_updated', DateTime(
                       timezone=True), onupdate=func.now())
                   )

message_seen = Table('message_seen', Base.metadata,
                     Column('userId', Integer, ForeignKey('users.id')),
                     Column('messageId', Integer, ForeignKey('messages.id')),
                     Column('seen', Boolean, default=False),
                     Column('time_created', DateTime(
                         timezone=True), default=func.now())
                     )

admins = Table('admins', Base.metadata,
               Column('userId', Integer, ForeignKey('users.id')),
               Column('groupId', Integer, ForeignKey('groups.id')),
               Column('time_created', DateTime(
                   timezone=True), default=func.now()),
               Column('time_updated', DateTime(
                   timezone=True), onupdate=func.now())
               )


class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), unique=False, nullable=True)
    # 260 = max path size on windows
    picturePath = Column(String(260), unique=False)
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())
    creator = Column(Integer, ForeignKey('users.id'))
    admins = relationship('User', secondary=admins)
    users = relationship('User', secondary=user_group)
    messages = relationship('Message')

    def __init__(self, **kwargs):
        super(Group, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Group {self.name!r}>'

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


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
    stories = relationship('Story')
    groups = relationship('Group')
    friends = relationship('Friend', secondary='friends',
                           primaryjoin='User.id == Friend.userId',
                           secondaryjoin='User.id == Friend.friendId',
                           )
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)

    def __repr__(self):
        return f'<User {self.firstName!r} {self.lastName!r}>'


class Friend(Base):
    __tablename__ = 'friends'
    id = Column(Integer, primary_key=True)
    userId = Column(Integer, ForeignKey('users.id'))
    friendId = Column(Integer, ForeignKey('users.id'))
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    def __init__(self, **kwargs):
        super(Friend, self).__init__(**kwargs)

    def __repr__(self):  # for debugging purposes only, yeet it later
        return f'<Friends {self.userId!r} : {self.friendId!r}>'


class Story(Base):
    __tablename__ = 'stories'
    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    description = Column(Text)
    picturePath = Column(String(260), nullable=False)
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())
    author = Column(Integer, ForeignKey('users.id'))


class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), unique=False)
    content = Column(Text, unique=False, nullable=False)
    picturePath = Column(String(260), unique=False)
    # 260 = max path size on windows
    author = Column(Integer, ForeignKey('users.id'))
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())
    seenBy = relationship('User', secondary=message_seen)
    groupId = Column(Integer, ForeignKey('groups.id'), default=None)
    parentMessage = Column(Integer, ForeignKey('messages.id'))

    def __init__(self, **kwargs):
        super(Message, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Message {self.title!r} : {self.content!r}>'
