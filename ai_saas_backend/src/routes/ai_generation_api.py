from flask import Blueprint, request, jsonify
from extensions import jwt_required, db
from models.chat import Chat, ChatMessage, ChatAttachment, SenderType
from flask_jwt_extended import get_jwt_identity
import os, uuid, base64, requests, time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # pasta src
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "static", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)

ai_generation_api = Blueprint("ai_generation_api", __name__)

OPENROUTER_PREFIXES = ("deepseek/", "google/", "tngtech/", "qwen/", "z-ai/")
OPENROUTER_SUFFIX = ":free"

def is_openrouter_model(model: str) -> bool:
    return bool(model) and ("/" in model or model.endswith(OPENROUTER_SUFFIX) or model.startswith(OPENROUTER_PREFIXES))

def uses_completion_tokens_for_openai(model: str) -> bool:
    return model.startswith("o") or model.startswith("gpt-5")

def supports_vision(model: str) -> bool:
    return model.startswith("gpt-4o") or model.startswith("o") or model.startswith("gpt-5")

def to_data_url(path: str, mimetype: str) -> str:
    with open(path, "rb") as f:
        return f"data:{mimetype};base64,{base64.b64encode(f.read()).decode('utf-8')}"

def build_messages_for_openai(session_messages, model: str):
    messages = []
    vision_ok = supports_vision(model)
    for m in session_messages:
        role = m.get("role") if isinstance(m, dict) else getattr(m, "role", "user")
        text = m.get("content") if isinstance(m, dict) else getattr(m, "content", "")
        attachments = []
        if hasattr(m, "attachments") and m.attachments is not None:
            attachments = [a.to_dict() for a in m.attachments]
        elif isinstance(m, dict):
            attachments = m.get("attachments", [])

        if not attachments:
            messages.append({"role": role, "content": text})
            continue

        if vision_ok:
            parts = [{"type": "text", "text": text}] if text.strip() else []
            non_images = []
            for att in attachments:
                mimetype = att["mimetype"] if isinstance(att, dict) else att.mimetype
                path = att["path"] if isinstance(att, dict) else att.path
                name = att.get("name") if isinstance(att, dict) else att.name
                if mimetype.startswith("image/") and os.path.exists(path):
                    parts.append({"type": "image_url", "image_url": {"url": to_data_url(path, mimetype)}})
                elif mimetype == "application/pdf" and os.path.exists(path):
                    with open(path, "rb") as f:
                        file_b64 = base64.b64encode(f.read()).decode("utf-8")
                    parts.append({
                        "type": "file",
                        "file": {
                            "filename": name,
                            "file_data": f"data:{mimetype};base64,{file_b64}"
                        }
                    })
                else:
                    non_images.append(name)
            if non_images:
                parts.append({"type": "text", "text": f"Arquivos anexados (não-imagem): {', '.join(non_images)}"})
            messages.append({"role": role, "content": parts})
        else:
            names = ", ".join([a["name"] if isinstance(a, dict) else a.name for a in attachments])
            merge_text = (text + "\n\n" if text else "") + f"[Anexos]: {names}" if names else text
            messages.append({"role": role, "content": merge_text})
    return messages

def build_messages_for_openrouter(session_messages, model: str):
    return build_messages_for_openai(session_messages, model)

def make_request_with_retry(url, headers, body, max_retries=5, backoff=3):
    for attempt in range(max_retries):
        response = requests.post(url, headers=headers, json=body, timeout=120)
        if response.status_code == 429:  # Too Many Requests
            if attempt < max_retries - 1:
                print("nova tentativa")
                time.sleep(backoff * (attempt + 1))
                continue
        return response
    return response

@ai_generation_api.route("/generate-text", methods=["POST"])
@jwt_required()
def generate_text():
    try:
        ct = request.content_type or ""
        files_to_save = []

        if ct.startswith("multipart/form-data"):
            user_input = request.form.get("input", "")
            model = request.form.get("model", "gpt-4o")
            temperature = float(request.form.get("temperature", 0.7))
            max_tokens = int(request.form.get("max_tokens", 1000))
            chat_id = request.form.get("chat_id")
            files = request.files.getlist("files") or []

            for f in files:
                safe_name = f.filename or f"file_{uuid.uuid4().hex}"
                final_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_{safe_name}")
                f.save(final_path)
                file_size = os.path.getsize(final_path)

                files_to_save.append({
                    "name": safe_name,
                    "path": final_path,
                    "mimetype": f.mimetype or "application/octet-stream",
                    "size_bytes": file_size
                })
        else:
            data = request.get_json(silent=True) or {}
            user_input = data.get("input", "")
            model = data.get("model", "gpt-4o")
            temperature = float(data.get("temperature", 0.7))
            max_tokens = int(data.get("max_tokens", 1000))
            chat_id = data.get("chat_id")

        if not user_input and not files_to_save:
            return jsonify({"error": "É necessário enviar uma mensagem ou anexos."}), 400

        user_id = get_jwt_identity()

        # 🔹 Criar chat se não existir
        chat = None
        if chat_id:
            chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()

        if chat is None:
            chat_title = "Novo Chat"
            if user_input:
                try:
                    title_res = requests.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
                        json={
                            "model": "gpt-3.5-turbo",
                            "messages": [{"role": "user", "content": f"Crie um título curto (menos de 5 palavras) sem aspas para: {user_input[:1000]}"}],
                            "max_tokens": 12,
                            "temperature": 0.5
                        },
                        timeout=10
                    )
                    if title_res.status_code == 200:
                        chat_title = title_res.json()["choices"][0]["message"]["content"].strip() or "Novo Chat"
                except:
                    chat_title = "Novo Chat"

            chat = Chat(user_id=user_id, title=chat_title)
            db.session.add(chat)
            db.session.commit()

        # 🔹 Criar mensagem do usuário
        user_msg = ChatMessage(
            chat_id=chat.id,
            role=SenderType.USER.value,
            content=user_input,
            created_at=datetime.utcnow()
        )
        db.session.add(user_msg)
        db.session.commit()  # agora user_msg.id existe

        # 🔹 Criar attachments vinculados à mensagem e gerar URLs para frontend
        uploaded_files = []
        for f in files_to_save:
            attachment_obj = ChatAttachment(
                message_id=user_msg.id,
                name=f["name"],
                path=f["path"],
                mimetype=f["mimetype"],
                size_bytes=f.get("size_bytes"),
                created_at=datetime.utcnow()
            )
            db.session.add(attachment_obj)
            db.session.commit()

            uploaded_files.append({
                "id": attachment_obj.id,
                "name": attachment_obj.name,
                "mimetype": attachment_obj.mimetype,
                "size_bytes": attachment_obj.size_bytes,
                "url": f"/api/chats/attachments/{attachment_obj.id}"
            })

        # 🔹 Histórico de mensagens
        history = ChatMessage.query.filter_by(chat_id=chat.id).order_by(ChatMessage.created_at).all()
        session_messages = [{"role": m.role, "content": m.content, "attachments": getattr(m, "attachments", [])} for m in history]

        # 🔹 Preparar payload IA
        if is_openrouter_model(model):
            endpoint = "https://openrouter.ai/api/v1/chat/completions"
            headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"}
            body = {
                "model": model,
                "messages": build_messages_for_openrouter(session_messages, model),
                "max_tokens": max_tokens,
                "temperature": temperature
            }
        else:
            endpoint = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
            body = {"model": model, "messages": build_messages_for_openai(session_messages, model)}
            if uses_completion_tokens_for_openai(model):
                body["max_completion_tokens"] = max_tokens
            else:
                body["max_tokens"] = max_tokens
                body["temperature"] = temperature

        response = make_request_with_retry(endpoint, headers, body, max_retries=5, backoff=3)

        if response.status_code == 429:
            return jsonify({"error": "Muitas requisições. Tente novamente em instantes."}), 429

        if response.status_code != 200:
            return jsonify({"error": "Erro ao gerar o texto", "details": response.text}), response.status_code

        result = response.json()
        generated_text = result["choices"][0]["message"]["content"]

        ai_msg = ChatMessage(
            chat_id=chat.id,
            role=SenderType.AI.value,
            content=generated_text,
            model_used=model,
            created_at=datetime.utcnow()
        )
        db.session.add(ai_msg)
        db.session.commit()

        return jsonify({
            "chat_id": chat.id,
            "chat_title": chat.title,
            "messages": [m.to_dict() for m in history] + [ai_msg.to_dict()],
            "generated_text": generated_text,
            "model_used": model,
            "temperature": None if uses_completion_tokens_for_openai(model) else temperature,
            "max_tokens": max_tokens,
            "uploaded_files": uploaded_files
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500