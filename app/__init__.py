from flask import Flask, redirect, url_for, render_template_string, session
from flask_sqlalchemy import SQLAlchemy
from flask_dance.contrib.google import make_google_blueprint
from config import Config
from flask_dance.consumer import oauth_authorized
from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
from flask_login import LoginManager, login_user
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
import logging
from logging.handlers import RotatingFileHandler
import os
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Створення директорії для логів, якщо її ще немає
if not os.path.exists('logs'):
    os.mkdir('logs')


app = Flask(__name__, template_folder='../templates')
app.config.from_object(Config)
# db.init_app(app)
db = SQLAlchemy(app)

# # Налаштування заголовків для захисту від XSS
# @app.after_request
# def add_security_headers(response):
#     # Content Security Policy: дозволяє завантажувати контент лише з вашого домену
#     response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self';"
    
#     # Інші заголовки для додаткового захисту (необов'язково)
#     response.headers['X-Content-Type-Options'] = 'nosniff'
#     response.headers['X-Frame-Options'] = 'DENY'
#     response.headers['Referrer-Policy'] = 'no-referrer'
#     return response

# # Ініціалізація бази даних для читання
# readonly_db_app = Flask(__name__, template_folder='../templates')
# readonly_db_app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_READONLY_DATABASE_URI
# readonly_db_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# readonly_db = SQLAlchemy()
# readonly_db.init_app(readonly_db_app)


# Ініціалізація login_manager для обробки сесій користувача
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "google.login"  # Перенаправлення на сторінку логіну через Google, якщо не залогінений

csrf = CSRFProtect(app)  # Ініціалізація CSRF-захисту
migrate = Migrate(app, db)  # Ініціалізація Flask-Migrate

# Налаштування логування
logging.basicConfig(level=logging.INFO)
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)

# Додавання обробника логів до додатка
app.logger.addHandler(file_handler)

app.logger.setLevel(logging.INFO)
app.logger.info('Application startup')

# Налаштування Google OAuth
google_bp = make_google_blueprint(
    client_id=Config.GOOGLE_CLIENT_ID,
    client_secret=Config.GOOGLE_CLIENT_SECRET,
    scope=["openid", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],  # Використання повних URL-ів для scope
    redirect_to="google_logged_in"
)
app.register_blueprint(google_bp, url_prefix='/login')


# Імпорт маршрутів та моделей
with app.app_context():
    from app import routes, models  # Імпортуємо тут, щоб уникнути кругового імпорту
    db.create_all()  # Створення таблиць бази даних

# Функція для завантаження користувача за його ID
@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))

@oauth_authorized.connect_via(google_bp)
def google_logged_in(blueprint, token):
    from app.models import User  # Імпортуємо User тут, щоб уникнути кругового імпорту
    resp = blueprint.session.get("/oauth2/v1/userinfo")
    if resp.ok:
        account_info = resp.json()
        google_id = account_info["id"]
        email = account_info.get("email")
        username = account_info.get("name")  # Отримуємо ім'я користувача, якщо доступне
        avatar_url = account_info.get("picture")

        # Перевірка, чи користувач існує
        user = User.query.filter_by(google_id=google_id).first()
        if user:
            # Оновлюємо існуючий токен, якщо він змінився
            user.access_token = token['access_token']
            user.username = username  # Оновлюємо ім'я користувача
            user.avatar_url = avatar_url
        else:
            # Створюємо нового користувача з access_token
            user = User(google_id=google_id, email=email, access_token=token['access_token'], username=username, avatar_url=avatar_url)
            db.session.add(user)
        
        db.session.commit()

        # Логування спроби входу
        app.logger.info(f"User {username} (ID: {user.id}) logged in successfully.")

        # Авторизуємо користувача через Flask-Login
        login_user(user, remember=True)

        # Перенаправлення на головну сторінку після входу
        #return redirect(url_for("index"))
        return """
        <script>
            window.close();
        </script>
        """

@app.route("/google_logged_in")
def google_logged_in():
    # Повертаємо JavaScript, який закриває вікно після входу
    return render_template_string("""
    <script>
        window.opener.postMessage("login_success", "*");
        window.close();
    </script>
    """)

@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = ""
    return response
