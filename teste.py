import time
from google import genai
from google.genai import types

# Configure com sua API Key do Google AI Studio
client = genai.Client(api_key="AIzaSyChsOwUNCoJVUHuQYbpaXyBshHVzoq2XYc")

prompt = """Uma pessoa jogando vídeo game, estressada e murmurando. 
Mal lançou o EA FC 26 e eu já quebrei meu monitor e controle novo"""

# Inicia a geração de vídeo
operation = client.models.generate_videos(
    model="veo-3.0-generate-001",
    prompt=prompt,
)

# Poll até estar pronto
while not operation.done:
    print("⏳ Aguardando geração do vídeo...")
    time.sleep(10)
    operation = client.operations.get(operation)  # <- ajuste aqui

generated_video = operation.response.generated_videos[0]
client.files.download(file=generated_video.video)
generated_video.video.save("dialogue_example.mp4")
print("Generated video saved to dialogue_example.mp4")
