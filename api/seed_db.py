import time
import os
import sys
from init_db import initdb
from drop_all import dropdb
from time import sleep
from random import randrange
from database import db_session, Base, engine
from faker import Faker
import models
fake = Faker()
dropdb()
initdb()


def printProgressBar(iteration, total, prefix='', suffix='', decimals=1, length=100, fill='█', printEnd="\n"):
    percent = ("{0:." + str(decimals) + "f}").format(100 *
                                                     (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    sys.stdout.write(f'{prefix} |{bar}| {percent}% {suffix}')
    if iteration != total:
        sys.stdout.flush()
        sys.stdout.write('\033[?25l')
        sys.stdout.write('\r')
        sys.stdout.write('\033[?25l')
        sys.stdout.flush()
    else:
        print(" Done!")


def generate_emails(amount):
    emails = []
    while len(set(emails)) < amount:
        email = fake.email()
        if email not in emails:
            emails.append(email)
    return list(set(emails))


def generate_users(amount):
    users = []
    emails = generate_emails(amount)
    printProgressBar(0, amount, prefix='Generating '+str(amount)+' users...',
                     suffix='', length=50)
    for i in range(amount):
        isAdmin = False
        if randrange(int(amount/100)+1) == 0:
            isAdmin = True
        users.append(models.User(
            firstName=fake.first_name(),
            lastName=fake.last_name(),
            email=emails[i],
            password=fake.password(),
            isAdmin=isAdmin,
            profilePicturePath=fake.image_url(),
        ))
        printProgressBar(i + 1, amount, prefix='Generating '+str(amount)+' users...',
                         suffix='', length=50)
    return users


def generate_groups(s, amount):
    groups = []
    printProgressBar(0, amount, prefix='Generating '+str(amount)+' groups...',
                     suffix='', length=50)
    for i in range(amount):
        admin = s.query(models.User).get(randrange(amount)+1)
        participants = [admin.id]
        groupSize = randrange(10)+1
        randParticipant = randrange(amount)+1
        for j in range(groupSize+1):
            participants.append(randParticipant)
            while randParticipant in participants:
                randParticipant = randrange(amount)+1
        if groupSize == 2:
            groupName = None
        else:
            groupName = " ".join(fake.words(randrange(6)+1))
        users = [s.query(models.User).get(id) for id in participants]
        admins = [admin]
        addedAdmin = [admin.id]
        for n in users:
            r = randrange(5)
            if r == 0 and n.id not in addedAdmin:
                admins.append(n)
                addedAdmin.append(n.id)
        groups.append(models.Group(
            name=groupName,
            picturePath=fake.image_url(),
            creator=admin.id,
            admins=admins, 
            users=users
        ))
        printProgressBar(i + 1, amount, prefix='Generating '+str(amount)+' groups...',
                         suffix='', length=50)
    return groups


def generate_friends(amount):
    friends = []
    printProgressBar(0, amount, prefix='Generating '+str(amount)+' friends...',
                     suffix='', length=50)
    for i in range(amount):
        randomFriends = []
        for j in range(10):
            randomFriend = randrange(amount)+1
            while randomFriend != i+1 and randomFriend in randomFriends:
                randomFriend = randrange(amount)+1
            randomFriends.append(randomFriend)
            friends.append(models.Friend(
                userId=i+1,
                friendId=randomFriend
            ))
        printProgressBar(i + 1, amount, prefix='Generating '+str(amount)+' friends...',
                         suffix='', length=50)
    return friends


def generate_messages(s, amount):
    messages = []
    printProgressBar(0, amount, prefix='Generating approx '+str(5*10*amount)+' messages...', suffix='', length=50)
    for i in range(amount):
        for j in range(randrange(int(amount/10))+1):
            ppath = None
            group = s.query(models.Group).get(i+1)
            # hacky, but saves time
            users = s.query(models.Group).get(i+1).users
            author = users[randrange(len(users))]
            if randrange(10) == 0:
                ppath = fake.image_url()
            messages.append(models.Message(
                title=" ".join(fake.words(randrange(6)+1)),
                content=fake.text(max_nb_chars=randrange(250) + 5),
                picturePath=ppath,
                author=author.id,
                groupId=group.id))
        printProgressBar(i + 1, amount, prefix='Generating approx '+str(5*10*amount)+' messages...',
                         suffix='', length=50)
    return messages


def generate_stories(amount):
    stories = []
    printProgressBar(0, amount, prefix='Generating '+str(amount)+' stories...',
                     suffix='', length=50)
    for i in range(amount):
        authorId = randrange(amount)+1
        stories.append(models.Story(
            title=" ".join(fake.words(randrange(6)+1)),
            description=fake.text(max_nb_chars=randrange(250) +
                                  5),
            picturePath=fake.image_url(),
            author=authorId
        ))
        printProgressBar(i + 1, amount, prefix='Generating '+str(amount)+' stories...',
                         suffix='', length=50)
    return stories


def seed_db(amount):
    s = db_session()
    s.add_all(generate_users(amount))
    s.commit()
    friends = generate_friends(amount)
    s.add_all(friends)
    s.commit()
    groups = generate_groups(s, amount)
    s.add_all(groups)
    s.commit()
    stories = generate_stories(amount)
    s.add_all(stories)
    s.commit()
    messages = (generate_messages(s, amount))
    s.add_all(messages)
    s.commit()


amount = 1000
try:
    amount = int(sys.argv[1])
    if amount < 4:
        raise ValueError(
            "Value is too low! Please provide a number greater than 4")
except ValueError as e:
    raise e
except IndexError:
    print('No value provided, 1000 will be used by default')
seed_db(amount)
