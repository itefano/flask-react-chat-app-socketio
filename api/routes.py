from utils import get_email, get_notifications
from flask import Blueprint
from database import db_session
from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, \
    unset_jwt_cookies, jwt_required
from dotenv import load_dotenv
import models
from sqlalchemy import desc
load_dotenv()

routes = Blueprint('example_blueprint', __name__)


@routes.route("/logout", methods=["POST"])
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
        groupId = request.json.get("groupId", None)
        if not groupId:
            return {"error": "No group provided"}, 401
        q = s.query(models.Group).filter(
            models.Group.users.any(id=get_jwt_identity())).all()
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    if not q:
        return {"error": "User doesn't have access to this room"}, 403
    else:
        return {"success": "User has access to this room"}, 200


@routes.route('/register')
def register():
    return {'registred': True}


@routes.route('/profile')
@jwt_required()
def my_profile():  # to be completed later
    response_body = {
        "name": "My name",
        "about": "Some stuff about me"
    }
    return response_body


@routes.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    try:
        s = db_session()
        # to edit to account for password hashing
        q = s.query(models.User).filter_by(
            email=email, password=password).first()
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
            res.append(
                {"name": e.name, "id": e.id, "picturePath": e.picturePath})
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"msg": "Something went wrong"}, 500
    return jsonify(res)


@routes.route('/messagelist', methods=['POST'])
@jwt_required()
def list_messages():
    groupId = request.json.get("groupId", None)
    try:
        s = db_session()
        group = s.query(models.Group).get(groupId)
        # vérifie que l'user est bien dans un groupe
        users = [e.id for e in models.Group.query.get(groupId).users]
        if (get_jwt_identity() not in users):
            print('WHAT')
            return {"error": "User does not have access to this group. How the hell did you get here?"}, 404
        group_messages = s.query(models.Message).filter_by(
            groupId=groupId).order_by(desc(models.Message.time_created)).all()
        messageList = []
        mId = [m.id for m in group_messages]
        usr = s.query(models.User).get(get_jwt_identity())
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
        groupInfo = {"name": group.name, "picturePath": group.picturePath}
        res = {"messages": messageList, "groupInfo": groupInfo,
               "currentUser": get_email()}
        s.close()
    except Exception as e:
        s.close()
        print(e)
        return {"error": "Something went wrong"}, 500
    return jsonify(res)


@routes.route('/notifications', methods=['POST'])
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


@routes.route('/markallasread', methods=['POST'])
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
