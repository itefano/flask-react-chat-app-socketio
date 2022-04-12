from datetime import datetime
import os
import json
from flask import Flask
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, JWTManager

from flask_socketio import SocketIO
from dotenv import load_dotenv
load_dotenv()

from routes import routes

api = Flask(__name__)

socketio = SocketIO(api, cors_allowed_origins="*",
                    logger=True, engineio_logger=True)
from sockets import socketio

api.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(api)


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

api.register_blueprint(routes)



if __name__ == "__main__":
    socketio.run(api, debug=True)
