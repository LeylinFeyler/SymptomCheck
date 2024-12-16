from app import db  # Імпорт з app безпосередньо
from flask_login import UserMixin

# Модель користувача
class User(db.Model, UserMixin):  
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    access_token = db.Column(db.String(500), nullable=True)  
    avatar_url = db.Column(db.String(500), nullable=True)

    def __repr__(self):
        return f"<User {self.email}>"

# Модель захворювань
class Disease(db.Model):
    __tablename__ = 'diseases'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    symptoms = db.Column(db.String(500), nullable=False)

# Модель історії чату
class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)  # Повідомлення користувача або чату
    diagnosis = db.Column(db.Text, nullable=True)  # Може бути відсутнім для простих відповідей
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('chat_history', lazy=True))

    def __repr__(self):
        return f"<ChatHistory user_id={self.user_id} diagnosis={self.diagnosis}>"


