from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo, Optional, Regexp

class UserForm(FlaskForm):
    full_name = StringField(
        "Nome Completo",
        validators=[
            DataRequired(),
            Length(min=4, max=100)
        ]
    )
    username = StringField(
        "Usuário",
        validators=[
            DataRequired(),
            Length(min=4, max=30)
        ]
    )
    password = PasswordField(
        "Senha",
        validators=[
            DataRequired(),
            Length(min=8),
            Regexp(
                r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$',
                message="A senha deve conter letra minúscula, maiúscula e caracter especial"
            )
        ]
    )
    confirm_password = PasswordField(
        "Confirme a Senha",
        validators=[
            DataRequired(),
            EqualTo("password", message="As senhas devem coincidir")
        ]
    )
    payment_method = SelectField(
        "Método de Pagamento",
        choices=[
            ("", "Nenhum"),
            ("credit_card", "Cartão de Crédito"),
            ("paypal", "PayPal")
        ],
        validators=[Optional()]
    )
    submit = SubmitField("Salvar")