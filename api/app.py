from database import db_session
import os
import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager

from flask_socketio import SocketIO, join_room, leave_room, emit, send
from dotenv import load_dotenv
import models
load_dotenv()
from sqlalchemy import desc


api = Flask(__name__)
api.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
socketio = SocketIO(api, cors_allowed_origins="*", logger=True, engineio_logger=True)
jwt = JWTManager(api)


def get_user(id):
    s = db_session()
    q = s.query(models.User).get(id)
    return q


@api.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response


def get_email():
    s = db_session()
    q = s.query(models.User).get(get_jwt_identity())
    s.close()
    if q:
        if q.email:
            return q.email
    return None # not needed but pretty

@api.route('/api/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    s = db_session()
    # to edit to account for password hashing
    q = s.query(models.User).filter_by(email=email, password=password).first()
    if not q:
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=q.id)
    response = {"access_token": access_token, "firstName": q.firstName}
    return response


@api.route('/api/register')
def register():
    return {'registred': True}


@api.route('/api/profile')
@jwt_required()
def my_profile():
    response_body = {
        "name": "My name",
        "about": "Some stuff about me"
    }
    return response_body


@api.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@api.route('/api/contactlist')
@jwt_required()
def list_contacts():
    s = db_session()
    user = s.query(models.User).filter_by(email=get_email()).one()
    q = s.query(models.Friend).filter_by(userId=user.id).all()
    res = []
    for e in q:
        friend = s.query(models.User).get(e.friendId)
        res.append(
            {"email": friend.email, "firstName": friend.firstName, "lastName": friend.lastName, "profilePicturePath": friend.profilePicturePath})
    return jsonify(res)


@api.route('/api/grouplist')
@jwt_required()
def list_groups():
    s = db_session()
    user = s.query(models.User).filter_by(email=get_email()).one()
    q = s.query(models.Group).filter(models.Group.users.any(id=user.id)).all()
    res = []
    for e in q:
        res.append(
            {"name": e.name, "id": e.id, "picturePath": e.picturePath})
    return jsonify(res)


@api.route('/api/messagelist', methods=['POST'])
@jwt_required()
def list_messages():
    groupId = request.json.get("groupId", None)
    s = db_session()
    group = s.query(models.Group).get(groupId)
    # vérifie que l'user est bien dans un groupe
    users = [e.id for e in models.Group.query.get(groupId).users]
    if (get_user(get_jwt_identity()) in users):
        return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
    messages = s.query(models.Message).filter_by(groupId=groupId).order_by(desc(models.Message.time_created)).all()
    messageList = []
    for m in messages:
        sender = s.query(models.User).get(m.author)
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
    return jsonify(res)


def client_ack():
    print('message was gotten')


@socketio.on("join", namespace="/chat")
@jwt_required()
def join_group(jsonresponse):
    groupId = jsonresponse.get("groupId")
    if groupId:
        s = db_session()
        group = s.query(models.Group).get(groupId)
        # vérifie que l'user est bien dans un groupe
        users = [e.id for e in models.Group.query.get(jsonresponse['groupId']).users]
        if (get_user(get_jwt_identity()) in users):
            return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
        join_room(groupId)
        print('joined room')
        emit("joined group", {"groupId": groupId}, namespace="/chat", room=groupId, broadcast=True)
        return {"success": True}
    return {"success":False}

@socketio.on("leave", namespace="/chat")
@jwt_required()
def leave_group(jsonresponse):
    groupId = jsonresponse.get("groupId")
    if groupId:
        s = db_session()
        # vérifie que l'user est bien dans un groupe
        users = [e.id for e in models.Group.query.get(jsonresponse['groupId']).users]
        if (get_user(get_jwt_identity()) in users):
            return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
        leave_room(groupId)
        send("left group", {"groupId": groupId}, namespace="/chat", room=groupId, broadcast=True)
        return {"success": True}
    return {"success":False}

@socketio.on('message sent', namespace="/chat")
@jwt_required()
def message_sent(jsonresponse):
    if 'message' in jsonresponse.keys() and jsonresponse['message'] != "" and jsonresponse['groupId'] and jsonresponse['groupId']:
        users = [e.id for e in models.Group.query.get(jsonresponse['groupId']).users] # gets all users, takes their ID and puts them into a list
        if get_jwt_identity() in users: # checks if the user is in the group
            s = db_session()
            title = None
            if jsonresponse.get('title'):
                title = jsonresponse.get('title')
            message = models.Message(
                title=title,
                content=jsonresponse['message'],
                author=get_jwt_identity(),
                groupId=jsonresponse['groupId'])
            try:
                s.add(message)
                s.commit()
                user = get_user(get_jwt_identity())
                send({
                            'content': jsonresponse['message'],
                            'title': jsonresponse.get('title'),
                            'sender': {
                                "firstName": user.firstName,
                                "profilePicturePath": user.profilePicturePath,
                                "email": user.email},
                            'profilePicturePath': get_user(get_jwt_identity()).profilePicturePath,
                            'timestamp': json.dumps(message.time_created, indent=4, sort_keys=True, default=str)
                            }, namespace="/chat", room=jsonresponse['groupId'], broadcast=True)
            except Exception as e:
                print("something went wrong during db insertion :'(")
                raise(e)
    return ['WHAT']

def message_received(methods=['POST']):
# renvoie une notification au back end en cas de réception de message
    print('message was received!!!')


if __name__ == "__main__":
    socketio.run(api, debug=True)
