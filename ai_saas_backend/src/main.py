from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/health")
def health():
    return {"status": "ta joia"}

if __name__ == "__main__":
    app.run(debug=True)
