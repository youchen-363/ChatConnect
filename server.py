from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import random
import subprocess
from ai_insult import InsultGenerator

generator = InsultGenerator()
app = Flask(__name__, static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chatconnect_v3.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_online = db.Column(db.Boolean, default=False)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.String(80), nullable=False)
    to_user = db.Column(db.String(80), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database only if it doesn't exist
with app.app_context():
    if not os.path.exists('chatconnect_v3.db'):
        db.create_all()
        # Create admin user if it doesn't exist
        admin = User(username='admin', password='admin', is_admin=True)
        db.session.add(admin)
        db.session.commit()

@app.route('/')
def root():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/auth.html')
def auth():
    return send_from_directory(app.static_folder, 'auth.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    user = User(username=data['username'], password=data['password'], is_admin=False)
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'success': True
        })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username'], password=data['password']).one_or_none()    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    else:
        user.is_online = True
        db.session.commit()
        return jsonify({'username': user.username, 'isAdmin': user.is_admin})

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.username for u in users])

@app.route('/api/messages', methods=['GET', 'POST'])
def messages():
    if request.method == 'POST':
        data = request.json
        msg = Message(
            from_user=data['from'],
            to_user=data['to'],
            text=data['text'],
            timestamp=datetime.utcnow()
        )
        db.session.add(msg)
        db.session.commit()
        return jsonify({'success': True})
    else:
        user1 = request.args.get('user1')
        user2 = request.args.get('user2')
        msgs = Message.query.filter(
            ((Message.from_user == user1) & (Message.to_user == user2)) |
            ((Message.from_user == user2) & (Message.to_user == user1))
        ).order_by(Message.timestamp).all()
        return jsonify([
            {
                'from': m.from_user,
                'to': m.to_user,
                'text': m.text,
                'timestamp': m.timestamp.isoformat()
            } for m in msgs
        ])

@app.route('/api/admin/users')
def admin_users():
    users = User.query.all()
    return jsonify([{
        'username': u.username,
        'is_admin': u.is_admin,
        'last_seen': u.last_seen.isoformat() if u.last_seen else None
    } for u in users])

@app.route('/api/online_users', methods=['GET'])
def online_users():
    users = User.query.filter_by(is_online=True).all()
    return jsonify([u.username for u in users])

@app.route('/api/logout', methods=['POST'])
def logout():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user:
        user.is_online = False
        db.session.commit()
    return jsonify({'success': True})

@app.route('/api/insult', methods=['POST'])
def insult():
    data = request.json
    context = data.get('context', '')
    target = data.get('target', '')
    tone = data.get('tone', '')
    insult = generator.generate_insult(context=context, tone_prompt=tone, target=target)
    return jsonify({'insult': insult})

@app.route('/api/play_flappy', methods=['POST'])
def play_flappy():
    try:
        subprocess.Popen(['python', 'Flappy-bird-python/flappy.py'])
        return jsonify({'success': True, 'message': 'Flappy Bird started on server.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000) 