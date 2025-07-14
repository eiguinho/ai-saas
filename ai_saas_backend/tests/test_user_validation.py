import pytest
import uuid

"""

@pytest.mark.parametrize("payload, error_field", [
    ({"full_name":"A", "username":f"user_{uuid.uuid4().hex[:6]}", "email":"invalidemail", "password":"Senha123!"}, "email"),
    ({"full_name":"A", "username":f"user_{uuid.uuid4().hex[:6]}", "email":f"email_{uuid.uuid4().hex[:6]}@example.com", "password":"semmaiuscula1!"}, "senha"),
    ({"full_name":"A", "username":f"user_{uuid.uuid4().hex[:6]}", "email":f"email_{uuid.uuid4().hex[:6]}@example.com", "password":"SemNumero!"}, "senha"),
    ({"full_name":"A", "username":f"user_{uuid.uuid4().hex[:6]}", "email":f"email_{uuid.uuid4().hex[:6]}@example.com", "password":"SemEspecial1"}, "senha"),
    ({"email":f"email_{uuid.uuid4().hex[:6]}@example.com", "username":f"user_{uuid.uuid4().hex[:6]}", "password":"Senha123!"}, "full_name"),
])
def test_create_user_invalid_data(test_client, payload, error_field):
    res = test_client.post("/api/users", json=payload)
    assert res.status_code == 400
    assert error_field in res.get_json()["error"].lower()

def test_create_user_large_fields(test_client):
    import uuid
    long_name = "a" * 150
    long_username = "u" * 50
    long_email = f"{uuid.uuid4().hex[:40]}@example.com"
    password = "Senha123!"

    res = test_client.post("/api/users", json={
        "full_name": long_name,
        "username": long_username,
        "email": long_email,
        "password": password
    })
    assert res.status_code in (201, 400)

    """