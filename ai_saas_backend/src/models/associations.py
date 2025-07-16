from extensions import db

project_content_association = db.Table(
    "project_content_association",
    db.Column("project_id", db.String, db.ForeignKey("projects.id"), primary_key=True),
    db.Column("content_id", db.String, db.ForeignKey("generated_contents.id"), primary_key=True),
)