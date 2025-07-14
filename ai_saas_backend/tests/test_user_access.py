# test_user_access.py

import pytest
import uuid
from extensions import bcrypt, db, redis_client
from models import User

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

    login_resp = test_client.post("/api/auth/login", json={
        "identifier": "adminuser",
        "password": "Senha123!"
    })
    assert login_resp.status_code == 200, login_resp.get_data(as_text=True)
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = test_client.get(f"/api/users/{other_id}", headers=headers)
    assert res.status_code == 200

def test_get_user_authorized(test_client):
    login_resp = test_client.post("/api/auth/login", json={
        "identifier": "testuser",
        "password": "Senha123!"
    })
    assert login_resp.status_code == 200, login_resp.get_data(as_text=True)
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = login_resp.get_json()["user"]["id"]

    user_resp = test_client.get(f"/api/users/{user_id}", headers=headers)
    assert user_resp.status_code == 200

def test_get_user_unauthorized(test_client):
    with test_client.application.app_context():
        user = db.session.query(User).filter_by(username="testuser").first()
        user_id = user.id

    user_resp = test_client.get(f"/api/users/{user_id}")
    assert user_resp.status_code == 401, user_resp.get_data(as_text=True)

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

    login_resp = test_client.post("/api/auth/login", json={
        "identifier": "testuser",
        "password": "Senha123!"
    })
    assert login_resp.status_code == 200, login_resp.get_data(as_text=True)
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    user_resp = test_client.get(f"/api/users/{other_user_id}", headers=headers)
    assert user_resp.status_code == 403

def test_login_rate_limit_block():
    from main import app as real_app

    real_app.config["TESTING"] = True
    real_app.config["WTF_CSRF_ENABLED"] = False

    # Limpa redis para garantir que não haja cache anterior do rate limit
    try:
        redis_client.flushdb()
    except Exception:
        pass

    client = real_app.test_client()

    # Faz mais tentativas que o limite para provocar bloqueio
    for _ in range(6):  # ajuste o número de tentativas de acordo com sua configuração real
        resp = client.post("/api/auth/login", json={
            "identifier": "testuser",
            "password": "senhaErrada123"
        })

    assert resp.status_code == 429
    assert "Você excedeu o número máximo de tentativas de login" in json_data["error"]