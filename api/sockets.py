
from flask_socketio import join_room, leave_room, emit, send
from app import socketio
from datetime import datetime
from database import db_session
from utils import get_user
import models
from flask_jwt_extended import get_jwt_identity, jwt_required

import json

def client_ack():
    print('message was gotten')

def message_received():
    # renvoie une notification au back end en cas de réception de message
    print('message was received!!!')

@socketio.on("join", namespace="/chat")
@jwt_required()
def join_group(jsonresponse):
    groupId = jsonresponse.get("groupId")
    if groupId:
        s = db_session()
        users = [e.id for e in models.Group.query.get(
            jsonresponse['groupId']).users]# vérifie que l'user est bien dans un groupe
        if (get_user(get_jwt_identity()).id not in users):
            s.close()
            return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
        else:
            join_room(groupId)
            send("joined group", {"groupId": groupId},
                 namespace="/chat", room=groupId, broadcast=True)
            s.close()
            return {"success": True}


@socketio.on("leave", namespace="/chat")
@jwt_required()
def leave_group(jsonresponse):
    groupId = jsonresponse.get("groupId")
    if groupId:
        s = db_session()
        # vérifie que l'user est bien dans un groupe
        users = [e.id for e in models.Group.query.get(
            jsonresponse['groupId']).users]
        if (get_user(get_jwt_identity()) in users):
            return {"errorMessage": "User does not have access to this group. How the hell did you get here?"}, 404
        leave_room(groupId)
        send("left group", {"groupId": groupId},
             namespace="/chat", room=groupId, broadcast=True)
        s.close()
        return {"success": True}
    s.close()
    return {"success": False}


@socketio.on('message sent', namespace="/chat")
@jwt_required()
def message_sent(jsonresponse):
    if jsonresponse.get('message') and\
            jsonresponse.get('message') != "" and\
            jsonresponse.get('groupId') and\
            jsonresponse.get('message').isprintable() and not\
            jsonresponse.get('message').isspace() and not\
            jsonresponse.get('message').startswith('<script>'):  # checks : if there is a message, that the message isn't somehow empty, that the message isn't a script, and that the message isn't a bunch of white spacesspace
        try:
            # gets all users, takes their ID and puts them into a list
            users = [e.id for e in models.Group.query.get(
                jsonresponse['groupId']).users]
        except Exception as e:
            s.close()
            return {"error", "User isn't present in the group"}, 403
        if get_jwt_identity() in users:
            s = db_session()
            title = None
            if jsonresponse.get('title'):
                title = jsonresponse.get('title')
            message = models.Message(
                title=title,
                # makes sure the user hasn't added extra spaces
                content=jsonresponse['message'].strip(),
                author=get_jwt_identity(),
                groupId=jsonresponse['groupId'])
            try:
                s.add(message)
                s.commit()
                notifications = []
                for user in users:
                    if user != get_jwt_identity():
                        notifications.append(models.Message_Seen(
                            messageId=message.id,
                            userId=user,
                            seen=False)
                        )
                    else:
                        notifications.append(models.Message_Seen(
                            messageId=message.id,
                            userId=user,
                            seen=True)
                        )

                try:
                    s.add_all(notifications)
                    s.commit()
                finally: # no idea why I did that ...?
                    s.close()
                    user = get_user(get_jwt_identity())
                    msg = {
                        'content': jsonresponse['message'],
                        'title': jsonresponse.get('title'),
                        'sender': {
                            "firstName": user.firstName,
                            "profilePicturePath": user.profilePicturePath,
                            "email": user.email},
                        'profilePicturePath': get_user(get_jwt_identity()).profilePicturePath,
                        'timestamp': json.dumps(datetime.now(), indent=4, sort_keys=True, default=str)
                    }
                    send(msg, namespace="/chat",
                         room=jsonresponse['groupId'], broadcast=True)
                    return {"success": True}
            except Exception as e:
                print("something went wrong during db insertion :'(")
                s.close()
                return {'error', 'Something went wrong'}, 500
                raise(e)
    return {'error', 'message was not sent'}, 500