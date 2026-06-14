from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user') # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    scans = db.relationship('Scan', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Scan(db.Model):
    __tablename__ = 'scans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    target_url = db.Column(db.String(256), nullable=False)
    risk_score = db.Column(db.Integer, default=0) # 0-100
    risk_level = db.Column(db.String(20), default='Low') # 'Low', 'Medium', 'High', 'Critical'
    status = db.Column(db.String(20), default='Pending') # 'Pending', 'Running', 'Completed', 'Failed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    results_json = db.Column(db.Text, nullable=True) # Detailed vulnerability JSON report

    def to_dict(self):
        results = {}
        if self.results_json:
            try:
                results = json.loads(self.results_json)
            except Exception:
                results = {}
        return {
            'id': self.id,
            'user_id': self.user_id,
            'target_url': self.target_url,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'results': results
        }
