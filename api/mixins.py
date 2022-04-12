from authlib.oauth1 import ClientMixin
from database import db_session
import models
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, relationship


class Client(ClientMixin, models.User):
    id = Column(Integer, primary_key=True)
    client_id = Column(String(48), index=True)
    client_secret = Column(String(120), nullable=False)
    default_redirect_uri = Column(Text, nullable=False, default='')
    user_id = Column(
        Integer, ForeignKey('user.id', ondelete='CASCADE')
    )
    user = relationship('User')

    def get_default_redirect_uri(self):
        return self.default_redirect_uri

    def get_client_secret(self):
        return self.client_secret

    def get_rsa_public_key(self):
        return None
