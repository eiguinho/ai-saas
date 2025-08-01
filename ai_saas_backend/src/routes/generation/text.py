"""
from dotenv import load_dotenv
import requests, json, os
load_dotenv()

headers = {"Authorization": f"Bearer {os.getenv("API_KEY")}", "Content-Type":"application/json"}
link = "https://api.openai.com/v1/chat/completions"
id_modelo = "gpt-4o"

body_mensagem = {
    "model": id_modelo,
    "messages": [{"role": "user", "content": "prompt de teste: me de boas vindas"}]
}

body_mensagem = json.dumps(body_mensagem)
requisicao = requests.post(link, headers=headers, data=body_mensagem)
print(requisicao)
print(requisicao.text)
"""