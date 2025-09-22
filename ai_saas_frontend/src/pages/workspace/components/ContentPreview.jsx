import { useEffect, useState } from "react";
import { apiFetch } from "../../../services/apiService";
import { generatedContentRoutes } from "../../../services/apiRoutes";

export default function ContentPreview({ content, isModal = false }) {
  const baseClasses = "object-contain rounded";
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (content.content_type === "image" && content.id) {
      const fetchImage = async () => {
        try {
          // Faz a requisição para a rota protegida
          const res = await apiFetch(generatedContentRoutes.getImage(content.id), {
            method: "GET",
          });

          // res é Response, transforma em blob
          const blob = await res.blob();

          // Cria URL local para renderizar
          setImageUrl(URL.createObjectURL(blob));
        } catch (err) {
          console.error("Erro ao carregar imagem:", err);
        }
      };

      fetchImage();

      // Cleanup: revoga blob URL quando componente desmonta
      return () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      };
    }
  }, [content]);

  if (content.content_type === "text") {
    const text = content.content_data || content.prompt;
    const displayText = isModal
      ? text
      : text?.length > 150
      ? text.substring(0, 150) + "..."
      : text;

    return (
      <div
        className={`text-xs text-gray-700 ${
          isModal ? "whitespace-pre-wrap break-words" : "line-clamp-3"
        }`}
      >
        {displayText}
      </div>
    );
  }

  if (content.content_type === "image") {
    return (
      <div
        className={
          isModal
            ? "flex justify-center"
            : "w-full max-h-[200px] overflow-hidden rounded"
        }
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={content.prompt || "Imagem gerada"}
            className={
              isModal
                ? `${baseClasses} max-w-full max-h-[400px]`
                : `${baseClasses} w-full`
            }
          />
        ) : (
          <p className="text-gray-500 text-xs text-center py-8">
            Carregando imagem...
          </p>
        )}
      </div>
    );
  }

  if (content.content_type === "video") {
    return (
      <div
        className={
          isModal
            ? "flex items-center justify-center mx-auto w-[400px] h-[300px] bg-gray-50 rounded"
            : "w-full max-h-[200px] overflow-hidden rounded"
        }
      >
        <video
          src={content.file_path}
          controls
          className={
            isModal ? `${baseClasses} max-w-full max-h-full` : `${baseClasses} w-full`
          }
          preload="metadata"
        />
      </div>
    );
  }

  return null;
}
