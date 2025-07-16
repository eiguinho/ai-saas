from flask import Blueprint, request, jsonify
from extensions import db, jwt_required, get_jwt_identity
from models import Project, User, GeneratedContent

project_api = Blueprint("project_api", __name__)

# Criar projeto
@project_api.route("/", methods=["POST"])
@jwt_required()
def create_project():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "Usuário inválido"}), 403

    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"error": "Nome é obrigatório"}), 400

    project = Project(
        name=name,
        description=description,
        user_id=user.id
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({"message": "Projeto criado com sucesso", "project": project.to_dict()}), 201


# Listar projetos do usuário logado
@project_api.route("/", methods=["GET"])
@jwt_required()
def list_projects():
    current_user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=current_user_id).all()
    return jsonify([p.to_dict() for p in projects]), 200


# Obter detalhes de um projeto
@project_api.route("/<project_id>", methods=["GET"])
@jwt_required()
def get_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Projeto não encontrado"}), 404

    if project.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    return jsonify(project.to_dict()), 200


# Atualizar projeto
@project_api.route("/<project_id>", methods=["PUT"])
@jwt_required()
def update_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Projeto não encontrado"}), 404

    if project.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    data = request.get_json()
    if "name" in data:
        project.name = data["name"]
    if "description" in data:
        project.description = data["description"]

    db.session.commit()
    return jsonify({"message": "Projeto atualizado com sucesso", "project": project.to_dict()}), 200


# Deletar projeto
@project_api.route("/<project_id>", methods=["DELETE"])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Projeto não encontrado"}), 404

    if project.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Projeto deletado com sucesso"}), 200


# Associar conteúdo a um projeto
@project_api.route("/<project_id>/add-content", methods=["POST"])
@jwt_required()
def add_content_to_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Projeto não encontrado"}), 404
    if project.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    data = request.get_json()
    content_id = data.get("content_id")
    content = GeneratedContent.query.get(content_id)

    if not content:
        return jsonify({"error": "Conteúdo não encontrado"}), 404
    if content.user_id != current_user_id:
        return jsonify({"error": "Você não é dono desse conteúdo"}), 403

    if content not in project.contents:
        project.contents.append(content)
        db.session.commit()

    return jsonify({"message": "Conteúdo adicionado ao projeto"}), 200


# Remover conteúdo de um projeto
@project_api.route("/<project_id>/remove-content", methods=["POST"])
@jwt_required()
def remove_content_from_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Projeto não encontrado"}), 404
    if project.user_id != current_user_id:
        return jsonify({"error": "Acesso negado"}), 403

    data = request.get_json()
    content_id = data.get("content_id")
    content = GeneratedContent.query.get(content_id)

    if not content:
        return jsonify({"error": "Conteúdo não encontrado"}), 404

    if content in project.contents:
        project.contents.remove(content)
        db.session.commit()

    return jsonify({"message": "Conteúdo removido do projeto"}), 200

@project_api.route("/<project_id>/update-contents", methods=["POST"])
@jwt_required()
def update_project_contents(project_id):
    current_user_id = get_jwt_identity()
    
    # Garante que o projeto pertence ao usuário logado
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    if not project:
        return jsonify({"error": "Projeto não encontrado ou sem permissão"}), 404
    
    data = request.get_json()
    content_ids = data.get("content_ids", [])
    
    # Busca somente os conteúdos que pertencem ao usuário e estão na lista
    valid_contents = []
    if content_ids:
        valid_contents = GeneratedContent.query.filter(
            GeneratedContent.user_id == current_user_id,
            GeneratedContent.id.in_(content_ids)
        ).all()
    
    # Substitui o relacionamento do projeto
    project.contents = valid_contents
    db.session.commit()
    
    return jsonify({"message": "Conteúdos atualizados com sucesso!"}), 200