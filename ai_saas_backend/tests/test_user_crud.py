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

def test_create_user_success(test_client):
    response = test_client.post("/api/users", json={
        "full_name": "New User",
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "Senha123!",
    })
    assert response.status_code == 201
    data = response.get_json()
    assert "id" in data
    assert "message" in data

def test_create_user_duplicate_username(test_client):
    response = test_client.post("/api/users", json={
        "full_name": "Test User Dup",
        "username": "testuser",
        "email": "testdup@example.com",
        "password": "Senha123!",
    })
    assert response.status_code == 400
    assert "username" in response.get_json()["error"].lower()

def test_create_user_duplicate_email(test_client):
    response = test_client.post("/api/users", json={
        "full_name": "Test Email Dup",
        "username": "uniqueuser",
        "email": "testuser@example.com",
        "password": "Senha123!",
    })
    assert response.status_code == 400
    assert "email" in response.get_json()["error"].lower()

def test_update_user_success(test_client):
    login_resp = test_client.post("/api/users/login", json={
        "username": "testuser",
        "password": "Senha123!"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = login_resp.get_json()["user"]["id"]

    response = test_client.put(f"/api/users/{user_id}", json={
        "full_name": "Updated User",
        "email": "updated@example.com"
    }, headers=headers)
    assert response.status_code == 200
    # Retorna mensagem, para acessar dados atualizados você precisaria buscar de novo

def test_update_user_forbidden(test_client):
    with test_client.application.app_context():
        hashed_password = bcrypt.generate_password_hash("Senha123!").decode("utf-8")
        other_user = User(
            id=str(uuid.uuid4()),
            full_name="Other User",
            username="otheruser_update",
            email="otheruser_update@example.com",
            password=hashed_password,
            role="user",
            is_active=True,
        )
        db.session.add(other_user)
        db.session.commit()

        other_id = other_user.id

    login_resp = test_client.post("/api/users/login", json={
        "username": "testuser",
        "password": "Senha123!"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = test_client.put(f"/api/users/{other_id}", json={
        "full_name": "Hacker Update"
    }, headers=headers)
    assert response.status_code == 403

def test_delete_user_success(test_client):
    login_resp = test_client.post("/api/users/login", json={
        "username": "testuser",
        "password": "Senha123!"
    })
    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = login_resp.get_json()["user"]["id"]

    response = test_client.delete(f"/api/users/{user_id}", headers=headers)
    assert response.status_code == 200
    assert "excluído" in response.get_json()["message"].lower()

def test_delete_user_forbidden(test_client):
    with test_client.application.app_context():
        # Cria o user que vai tentar deletar (testuser)
        hashed_password = bcrypt.generate_password_hash("Senha123!").decode("utf-8")
        testuser = User(
            id=str(uuid.uuid4()),
            full_name="Test User",
            username="testuser",
            email="testuser@example.com",
            password=hashed_password,
            role="user",
            is_active=True,
        )
        db.session.add(testuser)

        # Cria o outro user que não pode ser deletado pelo testuser
        other_user = User(
            id=str(uuid.uuid4()),
            full_name="Other User",
            username="otheruser_delete",
            email="otheruser_delete@example.com",
            password=hashed_password,
            role="user",
            is_active=True,
        )
        db.session.add(other_user)
        db.session.commit()

        other_user_id = other_user.id

    # Agora loga com o testuser, que existe
    login_resp = test_client.post("/api/users/login", json={
        "username": "testuser",
        "password": "Senha123!"
    })
    assert login_resp.status_code == 200, "Falha no login do testuser"

    token = login_resp.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Testa deletar o other_user (deve dar 403)
    response = test_client.delete(f"/api/users/{other_user_id}", headers=headers)
    assert response.status_code == 403