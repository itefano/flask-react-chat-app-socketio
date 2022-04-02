from random import randrange
from database import db_session, Base, engine
from faker import Faker
import models
fake = Faker()
from time import sleep
from drop_all import dropdb
from init_db import initdb
dropdb()
initdb()
def generate_emails(amt=10):
    emails = []
    while len(set(emails)) < amt:
        email = fake.email()
        if email not in emails:
            emails.append(email)
    return list(set(emails))


def generate_users(amt=10):
    users = []
    emails = generate_emails(amt)
    for i in range(amt):
        isAdmin = False
        if randrange(100) == 0:
            isAdmin = True
        users.append(models.User(
            firstName=fake.first_name(),
            lastName=fake.last_name(),
            email=emails[i],
            password=fake.password(),
            isAdmin=isAdmin,
            profilePicturePath=fake.image_url(),
        ))
    return users


def generate_groups(s, amt=10):
    groups = []
    userGroups = []
    insertedId = []
    for i in range(10):
        adminId = randrange(amt)+1
        participants = []
        randParticipant = adminId
        participantsId=[adminId]
        groupSize = randrange(10)+1
        for j in range(groupSize+1):
            if randParticipant not in participantsId:
                participants.append(randParticipant)
            participantsId.append(randParticipant)
            randParticipant = randrange(amt)+1
        if groupSize==1:
            if len(participants) > 0 and participants[0]!=None:
                tempParticipant = s.query(models.User).get(participants[0])
                groupName = tempParticipant.firstName+" "+tempParticipant.lastName
        groupName = " ".join(fake.words(randrange(6)+1))
        finalParticipants = []
        for n in participants:
            finalParticipants.append(s.query(models.User).get(n))
        insertedId.append(i+1)
        groups.append(models.Group(
            id=i+1,
            name=groupName,
            picturePath=fake.image_url(),
            groupAdmin=adminId,
            users=finalParticipants
        ))
    return groups


def generate_friends(s, amt=10):
    friends = []
    for i in range(amt):
        randomFriends = []
        for j in range(10):
            randomFriend = randrange(amt)+1
            while randomFriend != i+1 and randomFriend in randomFriends:
                randomFriend = randrange(amt)+1
            randomFriends.append(randomFriend)
            friends.append(models.Friend(
                userId=i+1,
                friendId=randomFriends[j]
            ))
    return friends


def generate_messages(s, amt=10):
    messages = []
    for i in range(amt):
        ppath = None
        group = s.query(models.Group).get(i+1)
        if group:
            for j in range(randrange(int(amt/10))+1):
                author = group.getusers()[randrange(len(group.getusers()))].id
                if randrange(amt) == 0:
                    ppath = fake.image_url(),
                messages.append(models.Message(
                    title=" ".join(fake.words(randrange(6)+1)),
                    content=fake.text(max_nb_chars=randrange(250) +
                                    5),  # very arbitrary, I know
                    picturePath=ppath,
                    author=author))
    return messages


def seed_db():
    s = db_session()
    print('generating users...')
    s.bulk_save_objects(generate_users(1000))
    s.commit()
    print('generating friendships...')
    s.bulk_save_objects(generate_friends(s, 1000))
    s.commit()
    print('generating groups...')
    groups = generate_groups(s, 1000) # HOW IS THIS GETTING INSERTED INTO THE DB ???????????????
    # s.bulk_save_objects(groups)
    s.commit()
    print('generating messages...')
    s.bulk_save_objects(generate_messages(s, 1000))
    s.commit()


seed_db()
