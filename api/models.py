from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Table, DateTime, func, LargeBinary
from sqlalchemy.orm import relationship
from database import Base
from faker import Faker

user_group = Table('users_groups', Base.metadata,
                   Column('userId', Integer, ForeignKey(
                       'users.id'), nullable=True),
                   Column('groupId', Integer, ForeignKey('groups.id', ondelete="CASCADE"),),
                   Column('time_created', DateTime(
                       timezone=True), default=func.now()),
                   Column('time_updated', DateTime(
                       timezone=True), onupdate=func.now())
                   )

admins=Table('admins', Base.metadata,
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
    time_updated = Column(DateTime(timezone=True),
                          default=func.now(), onupdate=func.now())
    creator = Column(Integer, ForeignKey('users.id'))
    admins = relationship('User', secondary=admins,
                          cascade="all, delete",)
    users = relationship('User', secondary=user_group,
                         cascade="all, delete")
    messages = relationship('Message')

    def __init__(self, **kwargs):
        super(Group, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Group {self.name!r}>'

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'participants': [e.firstName+" "+e.lastName for e in self.users],
            'picturePath': self.picturePath,
        }


class UserSalt(Base):
    __tablename__ = 'user_salts'
    id = Column(Integer, primary_key=True)
    email = Column(String(320), unique=True, nullable=False)
    salt = Column(LargeBinary, unique=False)


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    firstName = Column(String(50), unique=False, nullable=False)
    lastName = Column(String(100), unique=False, nullable=False)
    email = Column(String(320), unique=True, nullable=False)
    password = Column(LargeBinary, unique=False, nullable=False)
    gender = Column(String(120), unique=False)
    # 260 = max path size on windows
    isAdmin = Column(Boolean, unique=False, default=False)
    profilePicturePath = Column(String(260), unique=False)
    writtenmessages = relationship('Message')
    seen = relationship('Message_Seen')
    stories = relationship('Story')
    groups = relationship('Group',
                         cascade="all, delete")
    friends = relationship('Friend', secondary='friends',
                           primaryjoin='User.id == Friend.userId',
                           secondaryjoin='User.id == Friend.friendId',
                           )
    time_created = Column(DateTime(timezone=True), default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    def unread_messages(self):
        res = []
        for e in self.groups:
            for m in e.messages:
                msg = Message_Seen.query.filter_by(
                    seen=False, messageId=m.id).first()
                if msg:
                    res.append(msg)
        return res

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)

    def __repr__(self):
        return f'<User {self.firstName!r} {self.lastName!r}>'

    @property
    def serialize(self):
        return {
            'id': self.id,
            'firstName': self.firstName,
            'lastName': self.lastName,
            'email': self.email,
            'gender': self.gender,
            'profilePicturePath': self.profilePicturePath,
        }

    def get_notification_amount(self):
        q = User.query.filter_by(id=self.id).join(
            Message_Seen).filter_by(seen=False).count()
        if not q:
            q = 0
        return q


class Friend(Base):
    __tablename__ = 'friends'
    id = Column(Integer, primary_key=True)
    userId = Column(Integer, ForeignKey('users.id'))
    friendId = Column(Integer, ForeignKey('users.id'))
    request_pending = Column(Boolean, default=True)
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
    slug = Column(String(255), unique=True)
    author = Column(Integer, ForeignKey('users.id'))

    def __init__(self, **kwargs):
        super(Story, self).__init__(**kwargs)
        fake = Faker()
        # arbitrary length, might change it later
        tSlug = self.title.lower().replace(' ', '-')+"-"+fake.md5()[0:10]
        # make sure the slug is unique
        while Story.query.filter_by(slug=tSlug).first():
            tSlug = self.title.lower().replace(' ', '-')+"-"+fake.md5()[0:10]
        self.slug = tSlug

    @property
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'authorName': User.query.filter_by(id=self.author).first().firstName,
            'authorEmail': User.query.filter_by(id=self.author).first().email,
            'picturePath': self.picturePath,
            'description': self.description,
            'time_created': self.time_created,
            'slug': self.slug
        }


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
    seenBy = relationship('Message_Seen')
    groupId = Column(Integer, ForeignKey('groups.id'), default=None, nullable=True)
    # future implementation of message threads/replies
    parentMessage = Column(Integer, ForeignKey('messages.id'))

    def __init__(self, **kwargs):
        super(Message, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Message {self.title!r} : {self.content!r}>'


class Message_Seen(Base):
    __tablename__ = 'messages_seen'
    id = Column(Integer, primary_key=True)
    userId = Column(Integer, ForeignKey('users.id'))
    messageId = Column(Integer, ForeignKey('messages.id'))
    seen = Column(Boolean, default=False)
    time_created = Column(DateTime(
        timezone=True), default=func.now())

    def __init__(self, **kwargs):
        super(Message_Seen, self).__init__(**kwargs)

    def __repr__(self):  # for debugging purposes only, yeet it later
        word = "didn't read"
        if self.seen:
            word = 'read'
        return f'<Notification {self.userId!r} {word} {self.messageId!r}>'
