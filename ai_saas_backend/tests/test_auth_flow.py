import pytest
import uuid
from extensions import bcrypt, db, redis_client
from models import User
from flask_jwt_extended import decode_token
from datetime import timedelta


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


def test_login_success(test_client):
    resp = test_client.post("/api/auth/login", json={
        "identifier": "testuser",  # pode ser username ou email
        "password": "Senha123!"
    })
    assert resp.status_code == 200, resp.get_data(as_text=True)
    data = resp.get_json()
    assert "access_token" in data
    assert "user" in data


def test_login_invalid_password(test_client):
    resp = test_client.post("/api/auth/login", json={
        "identifier": "testuser",
        "password": "Errada123!"
    })
    assert resp.status_code == 401, resp.get_data(as_text=True)
    assert resp.get_json()["error"] == "Credenciais inválidas"


def test_logout_and_token_revocation(test_client):
    resp = test_client.post("/api/auth/login", json={
        "identifier": "testuser",
        "password": "Senha123!"
    })
    assert resp.status_code == 200, resp.get_data(as_text=True)
    token = resp.get_json()["access_token"]
    user_id = resp.get_json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    logout_resp = test_client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200, logout_resp.get_data(as_text=True)

    access_resp = test_client.get(f"/api/users/{user_id}", headers=headers)
    assert access_resp.status_code == 401
    assert "token has been revoked" in access_resp.get_json().get("msg", "").lower()


def test_access_with_revoked_token(test_client):
    resp = test_client.post("/api/auth/login", json={
        "identifier": "testuser",
        "password": "Senha123!"
    })
    assert resp.status_code == 200, resp.get_data(as_text=True)
    token = resp.get_json()["access_token"]
    user_id = resp.get_json()["user"]["id"]
    jti = decode_token(token)["jti"]

    redis_client.setex(jti, timedelta(hours=2), "true")

    headers = {"Authorization": f"Bearer {token}"}
    res = test_client.get(f"/api/users/{user_id}", headers=headers)

    assert res.status_code == 401
    assert "token has been revoked" in res.get_json().get("msg", "").lower()


def test_access_with_invalid_token_format(test_client):
    headers = {"Authorization": "Bearer token_invalido"}
    res = test_client.get("/api/users/someid", headers=headers)
    assert res.status_code in (401, 422)