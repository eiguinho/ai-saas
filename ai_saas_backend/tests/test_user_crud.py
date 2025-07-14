import pytest
import uuid
from extensions import bcrypt, db
from models import User
import io
from unittest.mock import patch
from werkzeug.datastructures import MultiDict


# Fixture para configurar o cliente de teste
@pytest.fixture(scope="module")
def test_client():
    from main import app
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # Banco de dados em memória
    app.config["WTF_CSRF_ENABLED"] = False

    with app.app_context():
        db.create_all()

        # Criação de um usuário de teste
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

        yield app.test_client()  # O cliente de teste

        db.session.remove()
        db.drop_all()




def test_create_user_success(test_client):
    # Mockando a verificação de e-mail no Redis (sempre retorna que o e-mail foi verificado)
    with patch('your_module.redis_client.get') as mock_get:
        mock_get.return_value = b"true"  # Simula o valor que seria retornado do Redis

        # Criando os dados do formulário
        data = MultiDict([
            ("full_name", "New User"),
            ("username", "newuser"),
            ("email", "newuser@example.com"),
            ("password", "Senha123!"),
        ])

        # Enviando os dados via POST (sem foto)
        response = test_client.post(
            "/api/auth/",  # Endpoint de criação do usuário
            data=data,  # Dados do formulário
            content_type='multipart/form-data',  # Tipo de conteúdo
        )

        # Verificação do status de sucesso
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data  # Verifica se o ID do usuário foi retornado
        assert "message" in data  # Verifica se a mensagem foi retornada

"""
# Teste de criação de usuário com nome de usuário duplicado
def test_create_user_duplicate_username(test_client):
    data = MultiDict([
        ("full_name", "Test User Dup"),
        ("username", "testuser"),  # O mesmo nome de usuário
        ("email", "testdup@example.com"),
        ("password", "Senha123!"),
    ])

    # Simula o envio de um arquivo (foto de perfil)
    file = io.BytesIO(b"fake image data")  # Simula o arquivo
    file.name = "perfil_photo.jpg"  # Definindo um nome de arquivo para o upload
    
    # Corrigido: passar o arquivo via o parâmetro `files` e os dados via `data`
    response = test_client.post(
        "/api/auth/",
        data=data,
        files={"perfil_photo": (file, file.name)}
    )
    
    assert response.status_code == 400
    assert "username" in response.get_json()["error"].lower()


# Teste de criação de usuário com e-mail duplicado
def test_create_user_duplicate_email(test_client):
    data = MultiDict([
        ("full_name", "Test Email Dup"),
        ("username", "uniqueuser"),
        ("email", "testuser@example.com"),  # O mesmo e-mail
        ("password", "Senha123!"),
    ])

    # Simula o envio de um arquivo (foto de perfil)
    file = io.BytesIO(b"fake image data")  # Simula o arquivo
    file.name = "perfil_photo.jpg"  # Definindo um nome de arquivo para o upload
    
    # Corrigido: passar o arquivo via o parâmetro `files` e os dados via `data`
    response = test_client.post(
        "/api/auth/",
        data=data,
        files={"perfil_photo": (file, file.name)}
    )
    
    assert response.status_code == 400
    assert "email" in response.get_json()["error"].lower()


# Teste de atualização de usuário bem-sucedido
def test_update_user_success(test_client):
    # Login para obter o token
    login_resp = test_client.post("/api/auth/login", data=MultiDict({
        "username": "testuser",
        "password": "Senha123!"
    }), content_type='multipart/form-data')

    assert login_resp.status_code == 200, f"Login falhou com status: {login_resp.status_code}"

    # Obtendo o token de acesso e o ID do usuário
    token = login_resp.get_json().get("access_token")
    assert token, "Token de acesso não encontrado"

    headers = {"Authorization": f"Bearer {token}"}
    user_id = login_resp.get_json()["user"]["id"]

    # Atualizando o usuário
    data = MultiDict([
        ("full_name", "Updated User"),
        ("email", "updated@example.com")
    ])
    
    response = test_client.put(f"/api/users/{user_id}", data=data, headers=headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert "message" in data and "User updated" in data["message"]


# Teste de atualização de usuário com permissão negada
def test_update_user_forbidden(test_client):
    # Criação de um novo usuário para testar a atualização
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

    # Login com o usuário que não pode atualizar o outro usuário
    login_resp = test_client.post("/api/auth/login", data=MultiDict({
        "username": "testuser",
        "password": "Senha123!"
    }), content_type='multipart/form-data')

    assert login_resp.status_code == 200, f"Login falhou com status: {login_resp.status_code}"

    token = login_resp.get_json().get("access_token")
    assert token, "Token de acesso não encontrado"

    headers = {"Authorization": f"Bearer {token}"}

    # Tentativa de atualização do outro usuário (deve falhar com 403)
    data = MultiDict([("full_name", "Hacker Update")])
    response = test_client.put(f"/api/users/{other_id}", data=data, headers=headers)

    assert response.status_code == 403  # Acesso negado


# Teste de exclusão de usuário bem-sucedido
def test_delete_user_success(test_client):
    # Login para obter o token
    login_resp = test_client.post("/api/auth/login", data=MultiDict({
        "username": "testuser",
        "password": "Senha123!"
    }), content_type='multipart/form-data')

    assert login_resp.status_code == 200, f"Login falhou com status: {login_resp.status_code}"

    token = login_resp.get_json().get("access_token")
    assert token, "Token de acesso não encontrado"

    headers = {"Authorization": f"Bearer {token}"}
    user_id = login_resp.get_json()["user"]["id"]

    # Tentando deletar o próprio usuário
    response = test_client.delete(f"/api/users/{user_id}", headers=headers)
    
    assert response.status_code == 200
    assert "excluído" in response.get_json()["message"].lower()


# Teste de exclusão de usuário com permissão negada
def test_delete_user_forbidden(test_client):
    # Criação de um novo usuário para tentar deletar
    with test_client.application.app_context():
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

    # Login como "testuser"
    login_resp = test_client.post("/api/auth/login", data=MultiDict({
        "username": "testuser",
        "password": "Senha123!"
    }), content_type='multipart/form-data')
    assert login_resp.status_code == 200, "Falha no login do testuser"

    token = login_resp.get_json().get("access_token")
    assert token, "Token de acesso não encontrado"

    headers = {"Authorization": f"Bearer {token}"}

    # Tentativa de deletar o "other_user", deve falhar com 403
    response = test_client.delete(f"/api/users/{other_user_id}", headers=headers)
    assert response.status_code == 403

    """