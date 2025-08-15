from flask import Blueprint, request, jsonify
from extensions import jwt_required
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("API_KEY")  # mantém o nome original para compat
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")  # nova

ai_generation_api = Blueprint("ai_generation_api", __name__)

# --- Helpers ---------------------------------------------------------------

OPENROUTER_PREFIXES = ("deepseek/", "google/", "tngtech/", "qwen/", "z-ai/")
OPENROUTER_SUFFIX = ":free"

def is_openrouter_model(model: str) -> bool:
    """
    Heurística segura:
    - Tem barra (ex: deepseek/deepseek-r1-0528:free), ou
    - Termina com ':free', ou
    - Começa com um dos prefixos conhecidos do OpenRouter.
    """
    if not model:
        return False
    return (
        "/" in model
        or model.endswith(OPENROUTER_SUFFIX)
        or model.startswith(OPENROUTER_PREFIXES)
    )

def uses_completion_tokens_for_openai(model: str) -> bool:
    """
    Mesma regra que você já tinha: modelos que começam com 'o' (o1, o3, o4-mini...)
    ou 'gpt-5' usam max_completion_tokens e bloqueiam temperatura.
    """
    return model.startswith("o") or model.startswith("gpt-5")

# --- Rota principal --------------------------------------------------------

@ai_generation_api.route("/generate-text", methods=["POST"])
@jwt_required()
def generate_text():
    data = request.get_json() or {}
    prompt = data.get("prompt")
    model = data.get("model", "gpt-4o")
    temperature = data.get("temperature", 0.7)
    max_tokens = data.get("max_tokens", 1000)

    if not prompt:
        return jsonify({"error": "O prompt é obrigatório"}), 400

    try:
        if is_openrouter_model(model):
            # -------- OpenRouter --------
            if not OPENROUTER_API_KEY:
                return jsonify({"error": "OPENROUTER_API_KEY ausente no servidor"}), 500

            endpoint = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                # Cabeçalhos opcionais recomendados pelo OpenRouter:
                # "HTTP-Referer": "https://seu-dominio.com",
                # "X-Title": "Nome da sua app",
            }
            body = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,       # OpenRouter aceita max_tokens
                "temperature": temperature,     # e aceita temperature
            }

        else:
            # -------- OpenAI (comportamento ORIGINAL preservado) --------
            if not OPENAI_API_KEY:
                return jsonify({"error": "API_KEY (OpenAI) ausente no servidor"}), 500

            endpoint = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            body = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
            }

            if uses_completion_tokens_for_openai(model):
                # Mantém sua regra para o*, gpt-5*
                body["max_completion_tokens"] = max_tokens
                # Não envia temperature (mantém seu comportamento)
            else:
                body["max_tokens"] = max_tokens
                body["temperature"] = temperature

        response = requests.post(endpoint, headers=headers, json=body)
        if response.status_code != 200:
            return jsonify({
                "error": "Erro ao gerar o texto",
                "details": response.text
            }), response.status_code

        result = response.json()
        # Ambos (OpenAI e OpenRouter) retornam no mesmo formato compatível:
        generated_text = result["choices"][0]["message"]["content"]

        # Para fins de auditoria, retornamos o temperature que FOI usado
        returned_temp = None
        if is_openrouter_model(model):
            returned_temp = temperature
        else:
            if not uses_completion_tokens_for_openai(model):
                returned_temp = temperature  # só quando permitido

        return jsonify({
            "prompt": prompt,
            "generated_text": generated_text,
            "model_used": model,
            "temperature": returned_temp,
            "max_tokens": max_tokens
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500