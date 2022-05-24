from click import option
from utils import get_email, get_notifications, get_user, isSafe, isEmail
from flask import Blueprint
from database import db_session
from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, verify_jwt_in_request
from dotenv import load_dotenv
import models
from sqlalchemy import desc
import bcrypt
from datetime import datetime
load_dotenv()

routes = Blueprint('example_blueprint', __name__)


@routes.route("/logout", methods=["GET"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@routes.route("/contactlist")
@jwt_required()
def list_contacts():
    try:
        s = db_session()
        user = s.query(models.User).filter_by(email=get_email()).one()
        q = s.query(models.Friend).filter_by(userId=user.id).all()
        res = []
        for e in q:
            friend = s.query(models.User).get(e.friendId)
            res.append(
                {"email": friend.email, "firstName": friend.firstName, "lastName": friend.lastName, "profilePicturePath": friend.profilePicturePath})
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    return jsonify(res)


@routes.route("/check_room", methods=["POST"])
@jwt_required()
def check_room():
    q = None
    try:
        s = db_session()
        groupId = request.data.get("groupId", None)
        if not groupId:
            s.close()
            return {"error": "No group provided"}, 401
        q = s.query(models.Group).filter(
            models.Group.users.any(id=get_jwt_identity())).all()
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    if not q:
        return {"error": "User doesn't have access to this room"}, 401
    else:
        return {"success": "User has access to this room"}, 200


@routes.route('/register')
def register():
    return {'registred': True}


@routes.route('/profile')
@jwt_required()
def my_profile():  # to be completed later
    try:
        s = db_session()
        user = s.query(models.User).filter_by(email=get_email()).one()
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Session desynchronized"}, 401
    return jsonify({"firstName": user.firstName, "lastName": user.lastName, "email": user.email, "profilePicturePath": user.profilePicturePath})


@routes.route('/get_info', methods=["GET"])
@jwt_required()
def get_info():
    try:
        user = get_user(get_jwt_identity())
    except Exception as e:
        print(e)
        return {"error": "Something went wrong"}, 500
    if not user:
        return {"error": "User not found"}, 404
    response = {"firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email}
    return response


@routes.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    print(email, password)
    try:
        s = db_session()
        salt = s.query(models.UserSalt).filter_by(email=email).first().salt
        # to edit to account for password hashing
        q = s.query(models.User).filter_by(
            email=email, password=bcrypt.hashpw(password=str.encode(password, 'utf-8'), salt=salt)).first()
        if not q:
            return {"msg": "Wrong email or password"}, 401
        access_token = create_access_token(identity=q.id)
        notifications = get_notifications(q.id)
        response = {"access_token": access_token,
                    "firstName": q.firstName,
                    "lastName": q.lastName,
                    "email": q.email,
                    "notifications": notifications}
    except Exception as e:
        s.close()
        print(e)
        return {"msg": "Something went wrong"}, 500
    return response


@routes.route('/grouplist')
@jwt_required()
def list_groups():
    try:
        s = db_session()
        q = s.query(models.Group).filter(
            models.Group.users.any(id=get_jwt_identity())).all()
        res = []
        for e in q:
            users = [u for u in e.users]
            name = None
            curr_user = get_user(get_jwt_identity())
            if not e.name or e.name == "":
                if len(users) < 2:  # s'il n'y a que 2 utilisateurs et que la conversation n'a pas de nom, la conversation prend le nom de l'autre utilisateur
                    if curr_user.id == users[0].id:
                        name = users[1].firstName+" "+users[1].lastName
                    else:
                        name = users[0].firstName+" "+users[0].lastName
                # si il y a plus de 2 utilisateurs, on ajoute le nom de tout les autres utilisateurs (en ignorant l'utilisateur courant)
                else:
                    name = ", ".join(
                        [u.firstName+" "+u.lastName for u in users if curr_user.id != u.id])
            else:
                name = e.name
            res.append(
                {"name": name, "id": e.id, "picturePath": e.picturePath, "users_names": [u.firstName for u in users]})
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"msg": "Something went wrong"}, 500
    return jsonify(res)


@routes.route('/messagelist', methods=['GET'])
@jwt_required()
def list_messages():
    groupId = request.args.get("groupId", None)
    try:
        s = db_session()
        group = s.query(models.Group).get(groupId)
        # vérifie que l'user est bien dans un groupe
        users = [e for e in s.query(models.Group).get(groupId).users]
        if (get_jwt_identity() not in [e.id for e in users]):
            return {"error": "User does not have access to this group"}, 403
        group_messages = s.query(models.Message).filter_by(
            groupId=groupId).order_by(desc(models.Message.time_created)).all()
        messageList = []
        mId = [m.id for m in group_messages]
        usr = s.query(models.User).get(get_jwt_identity())
        curr_user = get_user(get_jwt_identity())
        if not group.name or group.name == "":
            if len(users) < 2:  # s'il n'y a que 2 utilisateurs et que la conversation n'a pas de nom, la conversation prend le nom de l'autre utilisateur
                if curr_user.id == users[0].id:
                    name = users[1].firstName+" "+users[1].lastName
                else:
                    name = users[0].firstName+" "+users[0].lastName
            # si il y a plus de 2 utilisateurs, on ajoute le nom de tout les autres utilisateurs (en ignorant l'utilisateur courant)
            else:
                name = ", ".join(
                    [u.firstName+" "+u.lastName for u in users if curr_user.id != u.id])
        else:
            name = group.name
        for m in group_messages:
            sender = s.query(models.User).get(m.author)
            try:
                if (m.id not in mId):
                    usr.messages.append(m)
                s.commit()
            except Exception as e:
                s.close()
                raise(e)
            messageList.insert(0, {
                "title": m.title,
                "content": m.content,
                "picturePath": m.picturePath,
                "sender": {
                    "firstName": sender.firstName,
                    "profilePicturePath": sender.profilePicturePath,
                    "email": sender.email
                },
                "timestamp": m.time_created})
        groupInfo = {"name": name, "picturePath": group.picturePath}
        res = {"messages": messageList, "groupInfo": groupInfo,
               "currentUser": get_email()}
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    return jsonify(res)


@routes.route('/notifications', methods=['GET'])
@jwt_required()
def list_unread_messages():
    try:
        s = db_session()
        # vérifie que l'user est bien dans un groupe
        totalUnreadMessages = s.query(models.Message_Seen, models.Message, models.User).filter_by(userId=get_jwt_identity(), seen=False).join(
            models.Message, models.Message_Seen.messageId == models.Message.id).join(models.User, models.User.id == models.Message.author).all()
        unreadMessages = []
        for m in totalUnreadMessages:
            group = s.query(models.Group).get(m[1].groupId)
            unreadMessages.append(
                {"title": m[1].title,
                 "content": m[1].content,
                 "authorFirstName": m[2].firstName,
                 "authorLastName": m[2].lastName,
                 "authorProfilePicturePath": m[2].profilePicturePath,
                 "authorEmail": m[2].email,
                 "groupName": group.name,
                 "groupPicturePath": group.picturePath,
                 "timestamp": m[1].time_created
                 })

        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    return {"messages": unreadMessages}


@routes.route('/markallasread', methods=['GET'])
@jwt_required()
def mark_all_as_read():
    try:
        s = db_session()
        # vérifie que l'user est bien dans un groupe
        totalUnreadMessages = s.query(models.Message_Seen).filter_by(
            userId=get_jwt_identity(), seen=False).all()
        for m in totalUnreadMessages:
            m.seen = True
        s.commit()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    s.close()
    return {"success": True}


# looks for a contact group convo, or creates one if it doesn't exist
@routes.route('/contactgroup', methods=['GET'])
@jwt_required()
def contact_group():
    try:
        s = db_session()
        user = get_user(get_jwt_identity())
        email = request.args.get("email", None)
        contact = s.query(models.User).filter_by(email=email).first()
        if not contact:
            s.close()
            return {"error": "Contact does not exist"}, 404
        contact = contact
        contact_groups = s.query(models.Group).filter(models.Group.users.any(
            id=contact.id)).filter(models.Group.users.any(id=get_jwt_identity())).all()
        if not contact_groups:
            contact_group = models.Group(
                name=None, picturePath="", users=[user, contact])
            s.add(contact_group)
            s.commit()
            contact_groups = s.query(models.Group).filter(models.Group.users.any(
                id=contact.id)).filter(models.Group.users.any(id=get_jwt_identity())).all()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    res = []  # 🤮
    for e in contact_groups:
        name = None
        if e.name:
            name = e.name
        else:
            name = contact.firstName+" "+contact.lastName
        res.append({"name": name, "id": e.id, "picturePath": e.picturePath,
                   "users_names": [u.firstName for u in e.users]})
    s.close()
    return {"groups": res}


@routes.route('/story/<slug>', methods=['GET'])
def get_story(slug):
    try:
        s = db_session()
        story = s.query(models.Story).filter_by(slug=slug).first()
        if not story:
            return {"error": "Story does not exist"}, 404
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    s.close()
    return {"story": story.serialize}


@routes.route('/stories', methods=['GET'])
def get_stories():
    try:
        s = db_session()
        if verify_jwt_in_request(optional=True):
            userId = get_jwt_identity()
            today = datetime(datetime.today().year,
                             datetime.today().month, datetime.today().day)
            stories = s.query(models.Story).filter(models.Story.author != userId, models.Story.time_created >= today).order_by(
                models.Story.author.desc(), models.Story.time_created.desc()).limit(100).all()
            res = [e.serialize for e in stories]
        else:
            stories = s.query(models.Story).order_by(
                models.Story.time_created.desc()).limit(100).all()
            res = [e.serialize for e in stories]
        if len(res) == 0:
            return {"error": "No stories found"}, 404
    except Exception as e:
        s.close()
        raise(e)
        return {"error": "Something went wrong"}, 500
    s.close()
    # print('results:', {"stories":res})
    return {"stories": res}


@routes.route('/creategroup', methods=['GET'])
@jwt_required()
def create_group():
    try:
        s = db_session()
        user = get_user(get_jwt_identity())
        name = request.data.get("name", None)
        picturePath = request.data.get("picturePath", None)
        users = request.data.get("users", None)
        group = models.Group(name=name, picturePath=picturePath,
                             users=users+[user], admins=[users])
        s.add(group)
        s.commit()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    s.close()
    return {"success": True}


@routes.route('/search', methods=['GET'])
@jwt_required()
def search():
    try:
        s = db_session()
        user = get_user(get_jwt_identity())
        firstLastNames, lastFirstNames, firstNames, lastNames, emails = [], [], [], [], []
        search_term = request.args.get("search_term", None)
        if ' ' in search_term:  # in case they search for firstname and lastname
            for i in range(len(search_term.split(' '))):
                # takes the first n words as first names
                firstName = ' '.join(search_term.split(' ')[:i])
                # takes the first n words as first names
                lastName = ' '.join(search_term.split(' ')[i:])
                firstLastNames.extend(s.query(models.User).join(models.Friend, models.Friend.friendId == models.User.id).filter(models.Friend.userId == user.id).filter(models.User.firstName.ilike(
                    "%{}%".format(firstName))).filter(models.User.lastName.ilike("%{}%".format(lastName))).all())  # unholy abomination
                # all queries are built similarily : look for all users that are friends with the current connected user (and not necessary the other way around) bc I'm too lazy to fix it
                lastFirstNames.extend(s.query(models.User).join(models.Friend, models.Friend.friendId == models.User.id).filter(models.Friend.userId == user.id).filter(models.User.lastName.ilike("%{}%".format(
                    firstName))).filter(models.User.firstName.ilike("%{}%".format(lastName))).all())
        else:
            firstNames = s.query(models.User).join(models.Friend, models.Friend.friendId == models.User.id).filter(models.Friend.userId == user.id).filter(
                models.User.firstName.ilike("%{}%".format(search_term))).all()  # TODO : add filter for user
            lastNames = s.query(models.User).join(models.Friend, models.Friend.friendId == models.User.id).filter(models.Friend.userId == user.id).filter(
                models.User.lastName.ilike("%{}%".format(search_term))).all()
            emails = s.query(models.User).join(models.Friend, models.Friend.friendId == models.User.id).filter(models.Friend.userId == user.id).filter(
                models.User.email.ilike("%{}%".format(search_term))).all()
        groupNames = s.query(models.Group).join(models.User).filter(models.Group.users.any(id=get_jwt_identity())).filter(
            models.Group.name.ilike("%{}%".format(search_term))).all()
        res = dict()
        res["users"] = []
        res['isFirstLastName'] = False
        res['isLastFirstNames'] = False
        # monstrosity that gets rid of duplicates
        for resultBit in [firstLastNames, lastFirstNames, firstNames, lastNames, emails]:
            if resultBit and len(resultBit) > 0:
                for r in resultBit:
                    isIn = False
                    for e in res['users']:
                        if e['email'] == r.email:
                            isIn = True
                    if not isIn:
                        res['users'].append(r.serialize)
        if groupNames:
            res["groupNames"] = [e.serialize for e in groupNames]
        s.close()
        if not res or res == {} or len(res) == 0:
            return {"error": "No results found"}, 404
    except Exception as e:
        s.close()
        raise(e)
        return {"error": "Something went wrong"}, 500
    s.close()
    return {"results": res}


# ================== CREATES ====================

@routes.route('/signup', methods=['POST'])
def create_user():
    try:
        s = db_session()
        firstName = request.data.get("firstName", None)
        lastName = request.data.get("lastName", None)
        email = request.data.get("email", None)

        password1 = request.data.get("password1", None)
        password2 = request.data.get("password2", None)
        if password1!=password2:
            return {"error":"Passwords don't match!"}, 403
        password = password1
        gender = request.data.get("gender", None)
        isAdmin = False
        profilePicturePath = request.data.get('profilePicturePath', None)
        if not isSafe(password) or not email or not isEmail(email):
            s.close()
            return {"error":"Password isn't safe"}#TODO: Front-End check first.
        user = models.User(firstName=firstName, lastName=lastName, email=email, password=password,
                           gender=gender, isAdmin=isAdmin, profilePicturePath=profilePicturePath)
        s.add(user)
        s.commit()
        s.close()
    except Exception as e:
        print(e)
        s.close()
        return {"error":"User creation could not proceed. Something went wrong on our end."}, 500
