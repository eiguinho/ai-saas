import { useState, useEffect } from "react";
import { apiFetch } from "../../../../services/apiService";
import { generatedContentRoutes } from "../../../../services/apiRoutes";
import ContentPreview from "../../../workspace/components/ContentPreview";
import ContentDetailsModal from "../../../workspace/components/ContentDetailsModal";

export default function GeneratedFiles({ goBack }) {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Carregar todas as imagens
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await apiFetch(generatedContentRoutes.list);
        setImages(res); // res deve ser array de conteúdos {id, content_type, prompt, model_used, ...}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  // Função para download
  const handleDownload = async (content) => {
    try {
      const res = await apiFetch(generatedContentRoutes.getImage(content.id), { method: "GET" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${content.prompt?.slice(0, 20) || "imagem"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar imagem:", err);
    }
  };

  return (
    <div className="p-2">
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">Nenhuma imagem gerada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
          {images.map((content) => (
            <div
              key={content.id}
              className="relative cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
              onClick={() => setSelectedImage(content)}
            >
              <ContentPreview content={content} />
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <ContentDetailsModal
          content={selectedImage}
          onClose={() => setSelectedImage(null)}
          showAddButton={false}
          onAdd={() => handleDownload(selectedImage)}
        >
          <button
            onClick={() => handleDownload(selectedImage)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition"
          >
            Baixar Imagem
          </button>
        </ContentDetailsModal>
      )}
    </div>
  );
}
