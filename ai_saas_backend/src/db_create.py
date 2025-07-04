from config import engine, Base
from models.user import User

print("Criando banco e tabelas...")

Base.metadata.create_all(bind=engine)

print("Feito!")