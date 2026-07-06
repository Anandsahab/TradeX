import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'tradex.db')

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()