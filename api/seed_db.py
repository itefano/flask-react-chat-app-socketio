import sys
from init_db import initdb
from drop_all import dropdb
from random import randrange
from database import db_session
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


def generate_users(amount):
    users = []
    names = []
    emails = []
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
        users.append(models.User(
            firstName=names[i][0],
            lastName=names[i][1],
            email=emails[i],
            password=fake.password(),
            isAdmin=isAdmin,
            profilePicturePath=fake.image_url(),
        ))
        printProgressBar(i + 1, amount, prefix='Generating '+str(amount)+' users...',
                         suffix='', length=50)
    return users


def generate_groups(s, amount):#TODO fix the amount of users in groups
    groups = []
    printProgressBar(0, amount, prefix='Generating ~'+str(int(7.5*amount))+' groups...',
                     suffix='', length=50)
    for i in range(amount):
        admin = s.query(models.User).get(i+1)
        for ii in range(randrange(5)+5):  # ~7.5 groups created per person
            participants = [admin.id]
            friends = s.query(models.Friend).filter_by(userId=admin.id).all()
            groupSize = randrange(len(friends)-1)+1
            randParticipant = randrange(amount)+1
            for j in range(groupSize+1):#TODO: fix the amounts here
                participants.append(randParticipant)
                while randParticipant in participants:
                    randParticipant = randrange(amount)+1
            if groupSize == 2:
                groupName = None
            else:
                groupName = " ".join(fake.words(randrange(6)+1))
            users = [admin]
            for k in range(len(friends)):
                if k in participants:
                    u = s.query(models.User).filter_by(
                        id=friends[k].friendId).first()
                    users.append(u)
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
        printProgressBar(i + 1, amount, prefix='Generating ~'+str(int(7.5*amount))+' groups...',
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
    printProgressBar(0, len(groups), prefix='Generating ~'+str(int(5.5 *
                     len(groups)))+' messages...', suffix='', length=50)
    for i in range(len(groups)):
        for j in range(randrange(int(amount/10))+1):
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
        printProgressBar(i + 1, len(groups), prefix='Generating ~'+str(int(5.5*len(groups)))+' messages...',
                         suffix='', length=50)
    return messages


def generate_notifications(s):
    messages_seen = []
    messages = s.query(models.Message).all()
    groups = s.query(models.Group).all()
    printProgressBar(0, len(groups), prefix='Generating ~' +
                     str(int(7.5*len(messages)))+' notifications...', suffix='', length=50)
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
        printProgressBar(i + 1, len(groups), prefix='Generating ~'+str(int(7.5*len(messages)))+' notifications...',
                         suffix='', length=50)
    return messages_seen


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
    notifications = generate_notifications(s)
    s.add_all(notifications)
    s.commit()


amount = 100
try:
    amount = int(sys.argv[1])
    if amount < 4:
        raise ValueError(
            "Value is too low! Please provide a number greater than 4")
except ValueError as e:
    raise e
except IndexError:
    print('No value provided, 100 will be used by default')
seed_db(amount)
