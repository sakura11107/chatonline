from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True,default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(255),nullable=False,unique=True)
    password = db.Column(db.String(255),nullable=False)
    status = db.Column(db.Boolean, default=False)


class Friendship(db.Model):
    __tablename__ = 'friendships'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(10), nullable=False, default='pending')  # 'pending', 'accepted', 'rejected'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[user_id])
    friend = db.relationship('User', foreign_keys=[friend_id])