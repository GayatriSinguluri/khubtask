from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError
from bson import ObjectId
import re
import json
import logging

app = Flask(__name__)

# Configurations
app.config['SECRET_KEY'] = 'ba93f8b2f849b813da9683dd189056720310b2b54d48921a585350ff84446bbb'
app.config['JWT_SECRET_KEY'] = '2dcc3f27ed439d51e1745d579bab77793bbed28d420f0580664f8af966dcbe19'

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize MongoDB
client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
db = client['user_database']
users_collection = db['users']
notes_collection = db['notes']

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Utility function to serialize ObjectId
def serialize_objectid(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError("Object of type ObjectId is not JSON serializable")

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or len(username) < 4:
        return jsonify({"message": "Username must be at least 4 characters long."}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"message": "Invalid email format."}), 400

    if (not password or len(password) < 8 or 
        not re.search(r"[A-Z]", password) or 
        not re.search(r"[a-z]", password) or 
        not re.search(r"\d", password)):
        return jsonify({"message": "Password must be at least 8 characters long and include a mix of uppercase, lowercase letters, and numbers."}), 400

    if users_collection.find_one({'username': username}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
        users_collection.insert_one({'username': username, 'email': email, 'password': hashed_password})
    except DuplicateKeyError:
        return jsonify({"message": "User already exists"}), 400
    except ServerSelectionTimeoutError:
        return jsonify({"message": "Database connection error"}), 500
    
    logger.info(f"User {username} registered successfully.")
    return jsonify({"message": "User registered successfully. Please log in."}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({'username': username})

    if not user:
        return jsonify({"message": "User does not exist"}), 404

    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity={'username': username})
    logger.info(f"User {username} logged in successfully.")
    return jsonify(access_token=access_token, username=username, message="Login successful"), 200

@app.route('/notes', methods=['POST'])
@jwt_required()
def create_note():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    current_user = get_jwt_identity()
    username = current_user['username']

    if not title or not content:
        return jsonify({"message": "Title and content are required."}), 400

    try:
        notes_collection.insert_one({'username': username, 'title': title, 'content': content})
    except ServerSelectionTimeoutError:
        return jsonify({"message": "Database connection error"}), 500
    
    logger.info(f"Note created by {username}.")
    return jsonify({"message": "Note created successfully."}), 201

@app.route('/notes', methods=['GET'])
@jwt_required()
def get_notes():
    current_user = get_jwt_identity()
    username = current_user['username']
    notes = list(notes_collection.find({'username': username}, {'_id': 1, 'title': 1, 'content': 1}))

    return jsonify([{
        'id': str(note['_id']),
        'title': note['title'],
        'content': note['content']
    } for note in notes]), 200

@app.route('/notes/<note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    current_user = get_jwt_identity()
    username = current_user['username']

    if not title or not content:
        return jsonify({"message": "Title and content are required."}), 400

    try:
        note_id = ObjectId(note_id)
    except Exception as e:
        logger.error(f"Error converting note_id to ObjectId: {e}")
        return jsonify({"message": "Invalid note ID format"}), 400

    result = notes_collection.update_one(
        {'_id': note_id, 'username': username},
        {'$set': {'title': title, 'content': content}}
    )

    if result.matched_count == 0:
        logger.warning(f"Note {note_id} not found or unauthorized for user {username}.")
        return jsonify({"message": "Note not found or unauthorized"}), 404

    logger.info(f"Note {note_id} updated by {username}.")
    return jsonify({"message": "Note updated successfully."}), 200

@app.route('/notes/<note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    current_user = get_jwt_identity()
    username = current_user['username']

    try:
        note_id = ObjectId(note_id)
    except Exception as e:
        logger.error(f"Error converting note_id to ObjectId: {e}")
        return jsonify({"message": "Invalid note ID format"}), 400

    result = notes_collection.delete_one({'_id': note_id, 'username': username})

    if result.deleted_count == 0:
        logger.warning(f"Note {note_id} not found or unauthorized for user {username}.")
        return jsonify({"message": "Note not found or unauthorized"}), 404

    logger.info(f"Note {note_id} deleted by {username}.")
    return jsonify({"message": "Note deleted successfully."}), 200

# Protected route example
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"username": current_user['username']}), 200

if __name__ == '__main__':
    app.run(debug=True)
