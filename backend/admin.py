"""Flask-Admin panel for managing the SQLite database."""
import sqlite3

from flask import redirect, url_for
from flask_admin import Admin, BaseView, expose
from flask_admin.contrib.sqla import ModelView
from db_path import get_db_path

# We need SQLAlchemy models for Flask-Admin's SQLAlchemy backend
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# Define models that mirror the existing SQLite schema
class Job(db.Model):
    __tablename__ = "jobs"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text)
    company = db.Column(db.Text)
    location = db.Column(db.Text)
    job_type = db.Column(db.Text)
    description = db.Column(db.Text)
    skills = db.Column(db.Text)
    image_url = db.Column(db.Text)
    posted_at = db.Column(db.Text)
    salary = db.Column(db.Text)
    experience_level = db.Column(db.Text)
    apply_url = db.Column(db.Text)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.Text)
    password_hash = db.Column(db.Text)
    google_sub = db.Column(db.Text)
    display_name = db.Column(db.Text)
    created_at = db.Column(db.Text)


class JobApplication(db.Model):
    __tablename__ = "job_applications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    job_id = db.Column(db.Integer)
    ref_id = db.Column(db.Text)
    progress_stage = db.Column(db.Integer)
    applied_at = db.Column(db.Text)


# Admin views
class JobAdmin(ModelView):
    column_list = ["id", "title", "company", "location", "job_type", "experience_level", "salary", "posted_at"]
    column_searchable_list = ["title", "company", "location", "skills"]
    column_filters = ["job_type", "location", "experience_level", "company"]
    page_size = 50


class UserAdmin(ModelView):
    column_list = ["id", "email", "display_name", "google_sub", "created_at"]
    column_searchable_list = ["email", "display_name"]
    can_create = False
    page_size = 50


class ApplicationAdmin(ModelView):
    column_list = ["id", "user_id", "job_id", "ref_id", "progress_stage", "applied_at"]
    column_filters = ["user_id", "progress_stage"]
    page_size = 50


def register_admin(app):
    """Initialize Flask-Admin with SQLAlchemy models pointing at the existing SQLite DB."""
    db_path = get_db_path()
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    admin = Admin(app, name="Job Search Admin", url="/admin")
    admin.add_view(JobAdmin(Job, db.session, name="Jobs"))
    admin.add_view(UserAdmin(User, db.session, name="Users"))
    admin.add_view(ApplicationAdmin(JobApplication, db.session, name="Applications"))
