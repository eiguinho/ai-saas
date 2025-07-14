import sys
import os

# Adiciona o diretório src ao sys.path para que os imports funcionem no pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

import pytest
from main import app
from models import User
import uuid
from extensions import bcrypt, db
from datetime import timedelta
from flask_jwt_extended import decode_token

@pytest.fixture(scope="module")
def test_client():
    app.config["TESTING"] = True
    # Use o modo WAL para evitar o erro de "database is locked"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:?mode=wal"
    app.config["WTF_CSRF_ENABLED"] = False

    with app.app_context():
        # Criação do banco de dados
        db.create_all()
        
        # Criação de um usuário padrão para testes
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

        # Yield o cliente de testes do Flask
        yield app.test_client()

        # Limpeza do banco de dados após os testes
        db.session.remove()
        db.drop_all()

    # Nota: Não é necessário fazer um rollback explícito aqui, 
    # já que estamos limpando o banco após o "yield".