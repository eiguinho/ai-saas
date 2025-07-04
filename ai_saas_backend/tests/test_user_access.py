import pytest
import uuid
from extensions import bcrypt, db
from models import User

@pytest.fixture(scope="module")
def test_client():
    from main import app
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["WTF_CSRF_ENABLED"] = False

    with app.app_context():
        db.create_all()

        hashed_password = bcrypt.generate_password_hash("Senha123!").decode("utf-8")
        user = User(
            id=str(uuid.uuid4()),
            full_name="Test User",
            username="testuser",
            email="testuser@example.com",
            password=hashed_password,
            role="user",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

        yield app.test_client()

        db.session.remove()
        db.drop_all()

def test_admin_access_other_user(test_client):
    with test_client.application.app_context():
        admin = User(
            id=str(uuid.uuid4()),
            full_name="Admin User",
            username="adminuser",
            email="admin@example.com",
            password=bcrypt.generate_password_hash("Senha123!").decode("utf-8"),
            role="admin",
            is_active=True
        )
        other = User(
            id=str(uuid.uuid4()),
            full_name="Other User",
            username="otheruser",
            email="otheruser@example.com",
            password=bcrypt.generate_password_hash("Senha123!").decode("utf-8"),
            role="user",
            is_active=True
        )
        db.session.add_all([admin, other])
        db.session.commit()

        other_id = other.id

    login_resp = test_client.post("/api/users/login", json={
        "username": "adminuser",
        "password": "Senha123!"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = test_client.get(f"/api/users/{other_id}", headers=headers)
    assert res.status_code == 200

def test_get_user_authorized(test_client):
    login_resp = test_client.post("/api/users/login", json={
        "username": "testuser",
        "password": "Senha123!"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = login_resp.get_json()["user"]["id"]

    user_resp = test_client.get(f"/api/users/{user_id}", headers=headers)
    assert user_resp.status_code == 200

def test_get_user_unauthorized(test_client):
    user_resp = test_client.get("/api/users/some-random-id")
    assert user_resp.status_code == 401

def test_get_user_forbidden(test_client):
    with test_client.application.app_context():
        hashed_password = bcrypt.generate_password_hash("Senha123!").decode("utf-8")
        other_user = User(
            id=str(uuid.uuid4()),
            full_name="Other User",
            username="otheruser_forbidden",
            email="otheruser_forbidden@example.com",
            password=hashed_password,
            role="user",
            is_active=True
        )
        db.session.add(other_user)
        db.session.commit()
        other_user_id = other_user.id

    login_resp = test_client.post("/api/users/login", json={
        "username": "testuser",
        "password": "Senha123!"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    user_resp = test_client.get(f"/api/users/{other_user_id}", headers=headers)
    assert user_resp.status_code == 403