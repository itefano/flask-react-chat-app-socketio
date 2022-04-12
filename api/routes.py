from flask import Blueprint
from database import db_session
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager

import json
from dotenv import load_dotenv
import models
from sqlalchemy import desc, func
load_dotenv()
from utils import get_email, get_notifications, get_user

routes = Blueprint('example_blueprint', __name__)

@routes.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@routes.route("/api/contactlist")
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
    s.close()
    return jsonify(res)


@routes.route("/api/check_room", methods=["POST"])
@jwt_required()
def check_room():
    s = db_session()
    groupId = request.json.get("groupId", None)
    if not groupId:
        return {"error": "No group provided"}, 401
    q = s.query(models.Group).filter(
        models.Group.users.any(id=get_jwt_identity())).all()
    s.close()
    if not q:
        return {"error": "User doesn't have access to this room"}, 403
    else:
        return {"success": "User has access to this room"}, 200


@routes.route('/api/register')
def register():
    return {'registred': True}


@routes.route('/api/profile')
@jwt_required()
def my_profile():
    response_body = {
        "name": "My name",
        "about": "Some stuff about me"
    }
    return response_body


@routes.route('/api/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    s = db_session()
    # to edit to account for password hashing
    q = s.query(models.User).filter_by(email=email, password=password).first()
    if not q:
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=q.id)
    notifications = get_notifications()
    response = {"access_token": access_token,
                "firstName": q.firstName, "notifications": notifications}
    return response

@routes.route('/api/grouplist')
@jwt_required()
def list_groups():
    s = db_session()
    user = s.query(models.User).filter_by(email=get_email()).one()
    q = s.query(models.Group).filter(models.Group.users.any(id=user.id)).all()
    res = []
    for e in q:
        res.append(
            {"name": e.name, "id": e.id, "picturePath": e.picturePath})
    s.close()
    return jsonify(res)


@routes.route('/api/messagelist', methods=['POST'])
@jwt_required()
def list_messages():
    groupId = request.json.get("groupId", None)
    s = db_session()
    group = s.query(models.Group).get(groupId)
    # vérifie que l'user est bien dans un groupe
    users = [e.id for e in models.Group.query.get(groupId).users]
    if (get_user(get_jwt_identity()).id not in users):
        print('WHAT')
        return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
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
        finally:
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
    return jsonify(res)

