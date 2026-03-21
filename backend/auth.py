"""Email/password and Google OAuth authentication."""
import json
import os
import re
import sqlite3
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path

import jwt
from authlib.integrations.flask_client import OAuth
from flask import Blueprint, current_app, g, jsonify, redirect, request
from werkzeug.security import check_password_hash, generate_password_hash

DB_PATH = Path(__file__).resolve().parent / "jobs.db"

JWT_ALGO = "HS256"
JWT_EXPIRE_DAYS = 7

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
oauth = OAuth()


def _jwt_secret():
    # Empty JWT_SECRET_KEY= in .env would otherwise bypass the default and break signing.
    s = (os.environ.get("JWT_SECRET_KEY") or "").strip()
    if not s:
        s = "dev-only-change-JWT_SECRET_KEY-32bytes!!"
    return s


def create_token(user_id: int, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": now + timedelta(days=JWT_EXPIRE_DAYS),
        "iat": now,
    }
    raw = jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGO)
    return raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else str(raw)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGO])


def init_auth_db():
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT,
            google_sub TEXT UNIQUE,
            display_name TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )
    conn.commit()
    conn.close()


def _conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def get_user_by_id(user_id: int):
    conn = _conn()
    row = conn.execute("SELECT id, email, display_name FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_email(email: str):
    conn = _conn()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_local_user(email: str, password: str, display_name: str | None):
    conn = _conn()
    try:
        conn.execute(
            "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
            (
                email.strip().lower(),
                generate_password_hash(password, method="pbkdf2:sha256"),
                display_name or None,
            ),
        )
        conn.commit()
        uid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    finally:
        conn.close()
    return uid


def oauth_ready():
    cid = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    csec = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
    return bool(cid and csec)


def init_oauth(app):
    if not oauth_ready():
        return
    oauth.init_app(app)
    oauth.register(
        name="google",
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )


def frontend_base():
    return os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def backend_base():
    """Public URL of this API (used as Google OAuth redirect_uri). Must match Google Console."""
    return os.environ.get("BACKEND_URL", "http://127.0.0.1:5000").rstrip("/")


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _json_str(value, default=""):
    if value is None:
        return default
    if isinstance(value, str):
        return value
    return str(value)


def require_auth(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth[7:].strip()
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        try:
            data = decode_token(token)
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid or expired token"}), 401
        try:
            uid = int(data["sub"])
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid or expired token"}), 401
        user = get_user_by_id(uid)
        if not user:
            return jsonify({"error": "User not found"}), 401
        g.user = user
        return f(*args, **kwargs)

    return wrapped


@auth_bp.route("/config", methods=["GET"])
def auth_config():
    return jsonify({"google_enabled": oauth_ready()})


@auth_bp.route("/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    email = _json_str(body.get("email")).strip()
    password = _json_str(body.get("password"))
    display_name = _json_str(body.get("display_name")).strip() or None
    if not email or not EMAIL_RE.match(email):
        return jsonify({"error": "Valid email is required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if get_user_by_email(email):
        return jsonify({"error": "An account with this email already exists"}), 409
    try:
        uid = create_local_user(email, password, display_name)
        token = create_token(uid, email.strip().lower())
        return jsonify(
            {
                "token": token,
                "user": {"id": uid, "email": email.strip().lower(), "display_name": display_name},
            }
        )
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists"}), 409
    except sqlite3.OperationalError as e:
        current_app.logger.exception("register database error")
        return jsonify(
            {
                "error": "Could not write to the database. Check that jobs.db is writable.",
                "detail": str(e) if current_app.debug else None,
            }
        ), 500
    except (TypeError, ValueError) as e:
        current_app.logger.exception("register token error")
        return jsonify({"error": "Registration failed", "detail": str(e) if current_app.debug else None}), 500
    except Exception as e:
        current_app.logger.exception("register failed")
        return jsonify({"error": "Registration failed", "detail": str(e) if current_app.debug else None}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    email = _json_str(body.get("email")).strip()
    password = _json_str(body.get("password"))
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    user = get_user_by_email(email)
    if not user or not user.get("password_hash"):
        return jsonify({"error": "Invalid email or password"}), 401
    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401
    token = create_token(user["id"], user["email"])
    return jsonify(
        {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "display_name": user["display_name"],
            },
        }
    )


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    return jsonify({"user": g.user})


@auth_bp.route("/google", methods=["GET"])
def google_start():
    if not oauth_ready():
        return jsonify({"error": "Google sign-in is not configured on the server"}), 503
    redirect_uri = f"{backend_base()}/api/auth/google/callback"
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    if not oauth_ready():
        return jsonify({"error": "Google sign-in is not configured"}), 503
    try:
        token = oauth.google.authorize_access_token()
    except Exception:
        return redirect(f"{frontend_base()}/login?error=oauth_failed")

    userinfo = token.get("userinfo")
    if not userinfo:
        access = token.get("access_token")
        if access:
            try:
                req = urllib.request.Request(
                    "https://openidconnect.googleapis.com/v1/userinfo",
                    headers={"Authorization": f"Bearer {access}"},
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    userinfo = json.loads(resp.read().decode())
            except (urllib.error.URLError, json.JSONDecodeError, TimeoutError):
                userinfo = None
        if not userinfo:
            return redirect(f"{frontend_base()}/login?error=oauth_failed")

    email = (userinfo.get("email") or "").strip().lower()
    sub = userinfo.get("sub")
    name = userinfo.get("name") or userinfo.get("given_name")
    if not email or not sub:
        return redirect(f"{frontend_base()}/login?error=oauth_incomplete")

    conn = _conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE google_sub = ?", (sub,)).fetchone()
        if row:
            uid = dict(row)["id"]
            em = dict(row)["email"]
        else:
            existing = conn.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()
            if existing:
                ex = dict(existing)
                uid = ex["id"]
                em = ex["email"]
                if not ex.get("google_sub"):
                    conn.execute(
                        "UPDATE users SET google_sub = ?, display_name = COALESCE(display_name, ?) WHERE id = ?",
                        (sub, name, uid),
                    )
                    conn.commit()
            else:
                conn.execute(
                    "INSERT INTO users (email, google_sub, display_name) VALUES (?, ?, ?)",
                    (email, sub, name),
                )
                conn.commit()
                uid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
                em = email
    finally:
        conn.close()

    jwt_token = create_token(uid, em)
    return redirect(f"{frontend_base()}/auth/callback?token={jwt_token}")


def register_auth(app):
    init_auth_db()
    init_oauth(app)
    app.register_blueprint(auth_bp)
