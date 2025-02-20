from flask import request, jsonify
import jwt

SECRET_KEY = "your_secret_key"

def authenticate_request():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 403
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 403

    return None