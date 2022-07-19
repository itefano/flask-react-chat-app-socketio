from datetime import datetime
import os
import json
from flask import Flask
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, JWTManager
from flask_socketio import SocketIO
from dotenv import load_dotenv
load_dotenv()
from flask_cors import CORS
from routes import routes

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*",
                    logger=False, engineio_logger=False)
from sockets import socketio

app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'png', 'PNG', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SERVER_LOC'] = os.getenv('SERVER_LOC') # TO BE EDITED IN THE FUTURE
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config['TESTING'] = os.getenv('TESTING')
jwt = JWTManager(app)


@app.after_request
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

app.register_blueprint(routes, url_prefix='/api')



if __name__ == "__main__":
    socketio.run(app, debug=True)
