from waitress import serve
from main import app  # importa seu Flask app

if __name__ == "__main__":
    # Serve em 0.0.0.0 para aceitar conexões externas
    serve(app, host="0.0.0.0", port=8000)
