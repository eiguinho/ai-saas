import uuid
from extensions import bcrypt, db
from models import User
from main import app

with app.app_context():
    # Tenta localizar admin pelo email
    existing_admin = User.query.filter_by(email="admin@example.com").first()
    if existing_admin:
        print("⚠️ Admin já existe:", existing_admin.username)
    else:
        hashed_password = bcrypt.generate_password_hash("Admin123!").decode('utf-8')
        admin = User(
            id=str(uuid.uuid4()),
            full_name="Igor Silva",
            username="admin",
            email="admin@example.com",
            password=hashed_password,
            role="admin",
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin criado com sucesso!")