import { useState } from "react";
import { X } from "lucide-react";
import ContentPreview from "./ContentPreview";
import { formatDateTime } from "../../../utils/dateUtils";
import { TEXT_MODELS } from "../../../utils/constants";

export default function ContentDetailsModal({ content, onClose, onAdd, showAddButton = false }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
      <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100" aria-label="Fechar modal">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Detalhes do Conteúdo</h2>

        <div className="mb-4">
          <div className="max-h-64 overflow-y-auto">
            <ContentPreview content={content} isModal />
          </div>
        </div>

        <div className="text-sm text-gray-700 space-y-2 mb-6">
          <p>
            <strong>Prompt:</strong>{" "}
            {expanded ? content.prompt : content.prompt?.slice(0, 150) + (content.prompt?.length > 150 ? "..." : "")}
            {content.prompt?.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 text-blue-600 hover:underline text-xs"
              >
                {expanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </p>

          <p><strong>Modelo:</strong> {TEXT_MODELS.find(m => m.value === content.model_used)?.label || content.model_used}</p>
          {content.style && <p><strong>Estilo:</strong> {content.style}</p>}
          {content.ratio && <p><strong>Ratio:</strong> {content.ratio}</p>}
          {content.content_type === "text" && <p><strong>Temperatura:</strong> {content.temperature ?? "—"}</p>}
          {content.content_type === "video" && <p><strong>Duração:</strong> {content.duration ? `${content.duration}s` : "—"}</p>}
          <p><strong>Criado em:</strong> {formatDateTime(content.created_at)}</p>
        </div>

        {showAddButton && (
          <button
            onClick={onAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition"
            aria-label="Adicionar conteúdo ao projeto"
          >
            Adicionar ao projeto
          </button>
        )}
      </div>
    </div>
  );
}
