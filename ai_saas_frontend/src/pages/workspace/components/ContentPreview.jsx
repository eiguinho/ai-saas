import { useEffect, useState } from "react";
import { apiFetch } from "../../../services/apiService";
import { generatedContentRoutes } from "../../../services/apiRoutes";

export default function ContentPreview({ content, isModal = false }) {
  const baseClasses = "object-contain rounded";
  const [mediaUrl, setMediaUrl] = useState(null);

  useEffect(() => {
    let isMounted = true; // evita atualizar estado após unmount
    const fetchMedia = async () => {
      try {
        if (!content.id) return;

        let res;
        if (content.content_type === "image") {
          res = await apiFetch(generatedContentRoutes.getImage(content.id), { method: "GET" });
        } else if (content.content_type === "video") {
          res = await apiFetch(generatedContentRoutes.getVideo(content.id), { method: "GET" });
        } else {
          return;
        }

        const blob = await res.blob();
        if (isMounted) setMediaUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error(`Erro ao carregar ${content.content_type}:`, err);
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [content]);

  // TEXTOS
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

  // IMAGENS
  if (content.content_type === "image") {
    return (
      <div
        className={
          isModal
            ? "flex justify-center"
            : "w-full max-h-[200px] overflow-hidden rounded"
        }
      >
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={content.prompt || "Imagem gerada"}
            className={isModal ? `${baseClasses} max-w-full max-h-[400px]` : `${baseClasses} w-full`}
          />
        ) : (
          <p className="text-gray-500 text-xs text-center py-8">Carregando imagem...</p>
        )}
      </div>
    );
  }

  // VÍDEOS
  if (content.content_type === "video") {
    return (
      <div
        className={
          isModal
            ? "flex items-center justify-center mx-auto w-[400px] h-[300px] bg-gray-50 rounded"
            : "w-full max-h-[200px] overflow-hidden rounded"
        }
      >
        {mediaUrl ? (
          <video
            src={mediaUrl}
            controls
            className={isModal ? `${baseClasses} max-w-full max-h-full` : `${baseClasses} w-full`}
            preload="metadata"
          />
        ) : (
          <p className="text-gray-500 text-xs text-center py-8">Carregando vídeo...</p>
        )}
      </div>
    );
  }

  return null;
}
