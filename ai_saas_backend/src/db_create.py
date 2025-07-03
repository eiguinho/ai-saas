from config import engine, Base
from models.user import User, Address

print("Criando banco e tabelas...")

Base.metadata.create_all(bind=engine)

print("Feito!")