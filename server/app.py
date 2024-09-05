from flask import Flask
from flask_cors import CORS
from models import db
from auth import auth , friends_bp
from openaigpt import chatgpt_bp


app = Flask(__name__, static_folder='../build', static_url_path='/')

@app.route('/')
def index():
    return app.send_static_file('index.html')

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/chatonline'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

db.init_app(app)

app.register_blueprint(chatgpt_bp)
app.register_blueprint(auth)
app.register_blueprint(friends_bp)



with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)
