from flask import Blueprint, request, jsonify
from models import db, User, Friendship
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

SECRET_KEY = "tellrisk"

auth = Blueprint('auth', __name__)
friends_bp = Blueprint('friends', __name__)

# 注册用户
@auth.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    exist_user = User.query.filter_by(username=username).first()
    if exist_user:
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, password=hashed_password, status=False)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

# 用户登录
@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm='HS256')
    
    user.status = True
    db.session.commit()
    return jsonify({'message': 'User logged in successfully', 'status': user.status, 'token': token}), 200

# 用户登出
@auth.route('/logout', methods=['POST'])
def logout():
    data = request.json
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = User.query.filter_by(id=decoded['user_id']).first()
        if user:
            user.status = False
            db.session.commit()
            return jsonify({'message': 'User logged out successfully'}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token is expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    

@auth.route('/search', methods=['GET'])
def search():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username is required'}), 400

    # 查询用户名（唯一），使用 `first()` 方法获取单个结果
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # 构建返回结果
    result = {'id': user.id, 'username': user.username}
    
    return jsonify(result), 200
   

# 发送好友请求
@friends_bp.route('/send_friend_request', methods=['POST'])
def send_friend_request():
    data = request.json
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')

    if not user_id or not friend_id:
        return jsonify({'error': 'User ID and friend ID are required'}), 400

    existing_request = Friendship.query.filter_by(user_id=user_id, friend_id=friend_id).first()
    if existing_request:
        return jsonify({'error': 'Friend request already sent'}), 400
    
    new_friendship = Friendship(user_id=user_id, friend_id=friend_id, status='pending')
    db.session.add(new_friendship)
    db.session.commit()
    return jsonify({'message': 'Friend request sent successfully'}), 201

# 接受好友请求
@friends_bp.route('/accept_friend_request', methods=['POST'])
def accept_friend_request():
    data = request.json
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')

    if not user_id or not friend_id:
        return jsonify({'error': 'User ID and friend ID are required'}), 400
    
    friendship = Friendship.query.filter_by(user_id=friend_id, friend_id=user_id, status='pending').first()
    if not friendship:
        return jsonify({'error': 'Friend request not found'}), 404
    
    friendship.status = 'accepted'
    db.session.commit()
    return jsonify({'message': 'Friend request accepted successfully'}), 200

# 拒绝好友请求
@friends_bp.route('/reject_friend_request', methods=['POST'])
def reject_friend_request():
    data = request.json
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')

    if not user_id or not friend_id:
        return jsonify({'error': 'User ID and Friend ID are required'}), 400

    friendship = Friendship.query.filter_by(user_id=friend_id, friend_id=user_id, status='pending').first()
    if not friendship:
        return jsonify({'error': 'Friend request not found'}), 404

    friendship.status = 'rejected'
    db.session.commit()

    return jsonify({'message': 'Friend request rejected'}), 200

# 获取好友列表
@friends_bp.route('/get_friends', methods=['GET'])
def get_friends():
    if request.method == 'OPTIONS':
        return '', 200
    # 从请求头中获取token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header is missing or invalid'}), 401
    
    # 从Authorization头中解析token
    token = auth_header.split(' ')[1]
    
    try:
        # 解析JWT token来获取user_id
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    # 查询该用户的已接受的好友关系
    accepted_friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) & (Friendship.status == 'accepted')
    ).all()

    # 收集好友信息
    friends = []
    for friendship in accepted_friendships:
        friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
        friend = User.query.get(friend_id)
        if friend:
            friends.append({'id': friend.id, 'username': friend.username})

    return jsonify(friends), 200


