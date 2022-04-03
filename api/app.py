from database import db_session
import os
import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager

from dotenv import load_dotenv
import models
load_dotenv()


api = Flask(__name__)
api.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(api)


def get_user(email):
    s = db_session()
    q = s.query(models.User).filter_by(email=email).first()
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

@api.route('/api/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    s = db_session()
    # to edit to account for password hashing
    q = s.query(models.User).filter_by(email=email, password=password).first()
    print(q)
    if not q:
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=email)
    response = {"access_token": access_token, "firstName": q.firstName}
    print(response)
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
    user = s.query(models.User).filter_by(email=get_jwt_identity()).one()
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
    user = s.query(models.User).filter_by(email=get_jwt_identity()).one()
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
    if (get_user(get_jwt_identity()) not in group.getusers()):
        return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
    q = s.query(models.Group).filter(models.Group.users.any()).all()
    messages = s.query(models.Message).filter_by(groupId=groupId).all()
    messageList = []
    for m in messages:
        sender = s.query(models.User).get(m.author)
        messageList.append({
            "title": m.title,
            "content": m.content,
            "picture": m.picturePath,
            "sender": {
                "firstName": sender.firstName,
                "profilePicturePath": sender.profilePicturePath,
                "email": sender.email
            },
            "timestamp": m.time_created})
    groupInfo = {"name": group.name, "picturePath": group.picturePath}
    res = {"messages": messageList, "groupInfo": groupInfo, "currentUser":get_jwt_identity()}
    return jsonify(res)


