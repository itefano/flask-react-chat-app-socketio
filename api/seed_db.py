import sys
from init_db import initdb
from drop_all import dropdb
from random import randrange
from database import db_session
from faker import Faker
import models
import bcrypt
from pathlib import Path
import os
fake = Faker()
dropdb()
initdb()

DIR_PATH = Path(__file__).resolve().parent

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


def generate_users(amount):
    users = []
    names = []
    emails = []
    user_salts =[]
    try:
        if os.path.exists(os.path.join(DIR_PATH,'passwords.txt')):
            os.remove(os.path.join(DIR_PATH,'passwords.txt'))
        f = open(os.path.join(DIR_PATH,"passwords.txt"), "a")
        while len(names) < amount:
            firstName = fake.first_name()
            lastName = fake.last_name()
            if ((firstName, lastName) not in names):
                names.append((firstName, lastName))

        for i in range(len(names)):
            email = names[i][0].lower()+names[i][1].lower() + \
                "@"+fake.safe_domain_name()
            emails.append(email)
        printProgressBar(0, amount, prefix='Generating '+str(amount)+' users...',
                        suffix='', length=50)
        for i in range(amount):
            isAdmin = False
            if randrange(10)+1 == 0:  # roughly 10% of user base will be admins
                isAdmin = True

            salt = bcrypt.gensalt()
            password = fake.password()
            f.write(emails[i]+': '+password+'\n')
            users.append(models.User(
                firstName=names[i][0],
                lastName=names[i][1],
                email=emails[i],
                password = bcrypt.hashpw(password=str.encode(password, 'utf-8'), salt=salt),
                isAdmin=isAdmin,
                profilePicturePath=fake.image_url(),
            ))
            user_salts.append(models.UserSalts(
                email=emails[i],
                salt = salt
            ))
            printProgressBar(i + 1, amount, prefix='Generating '+str(amount)+' users...',
                            suffix='', length=50)
        f.close()
        return users, user_salts
    except Exception as e:
        raise(e) 


def generate_groups(s, amount):
    groups = []
    printProgressBar(0, amount, prefix='Generating ~'+str(7*amount)+' groups...',
                     suffix='', length=50)
    for i in range(amount):
        admin = s.query(models.User).get(i+1)
        groupAmt = randrange(5)+5
        for ii in range(groupAmt):  # ~7.5 groups created per person
            participants = [admin.id]
            friends = s.query(models.Friend).filter_by(userId=admin.id).all()
            groupSize = randrange(len(friends))+1 # the use of min here avoids an infinite loop in the case where the amount of total users is too low (like ~10 ppl)
            if groupSize == 2:
                groupName = None
            else:
                groupName = " ".join(fake.words(randrange(6)+1))
            users = [admin]
            participants = [admin.id]
            friendsId = [friend.friendId for friend in friends]
            for k in range(min(groupSize, len(friends))):
                uid = friends[randrange(len(friends))].friendId
                if set(participants) == set(friendsId):# prevents endless loops in case user has too few friends
                    break
                while uid in participants:
                    uid = friends[randrange(len(friends))].friendId
                participants.append(uid)
                users.append(s.query(models.User).get(uid))
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
        printProgressBar(i + 1, amount, prefix='Generating ~'+str(7*amount)+' groups...',
                         suffix='', length=50)
    return groups


def generate_friends(amount):
    friends = []
    printProgressBar(0, amount, prefix='Generating '+str(amount)+' friends...',
                     suffix='', length=50)
    for i in range(amount):
        randomFriends = []
        for j in range(10):  # each user has 10 friends
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
    groups = s.query(models.Group).all()
    printProgressBar(0, len(groups), prefix='Generating ~'+str(int(9.5 *
                     len(groups)))+' messages...', suffix='', length=50)
    for i in range(len(groups)):
        for j in range(randrange(10)+5):  # ~9 messages per group
            ppath = None
            group = groups[i]
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
        printProgressBar(i + 1, len(groups), prefix='Generating ~'+str(int(9.5*len(groups)))+' messages...',
                         suffix='', length=50)
    return messages


def generate_notifications(s):
    messages_seen = []
    messages = s.query(models.Message).all()
    groups = s.query(models.Group).all()
    printProgressBar(0, len(groups), prefix='Generating ~' +
                     str(int(7*len(messages)))+' notifications...', suffix='', length=50)
    k = 0
    kk = 0
    for i in range(len(groups)):
        for j in range(len(groups[i].messages)):
            m = groups[i].messages[j]
            k += 1
            r = randrange(2)
            seen = True
            if r == 0:
                seen = False
            for u in groups[i].users:
                kk += 1
                messages_seen.append(models.Message_Seen(
                    userId=u.id,
                    messageId=m.id,
                    seen=seen
                ))
        printProgressBar(i + 1, len(groups), prefix='Generating ~'+str(int(7*len(messages)))+' notifications...',
                         suffix='', length=50)
    return messages_seen


def generate_stories(amount):
    stories = []
    printProgressBar(0, amount, prefix='Generating '+str(10*amount)+' stories...',
                     suffix='', length=50)
    for i in range(amount):
        authorId = i+1
        for j in range(10):# 10 stories per user
            stories.append(models.Story(
                title=" ".join(fake.words(randrange(6)+1)),
                description=fake.text(max_nb_chars=randrange(250) +
                                    5),
                picturePath=fake.image_url(),
                author=authorId
            ))
        printProgressBar(i + 1, amount, prefix='Generating '+str(10*amount)+' stories...',
                         suffix='', length=50)
    return stories


def seed_db(amount):
    s = db_session()
    usersNsalts = generate_users(amount)
    s.add_all(usersNsalts[0])#gotta get users AND their salts
    s.add_all(usersNsalts[1])
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
    notifications = generate_notifications(s)
    s.add_all(notifications)
    s.commit()
    print('All done!')


amount = 100
try:
    amount = int(sys.argv[1])
    if amount < 10:
        raise ValueError(
            "Value is too low! Please provide a number greater than 4")
except ValueError as e:
    raise e
except IndexError:
    print('No value provided, 100 will be used by default')
seed_db(amount)
