import { FileText, X } from "lucide-react";

export default function SelectedContentsSidebar({ selectedContents, onRemove, baseUrl }) {
  return (
    <aside className="relative w-72 p-4 bg-white rounded-lg shadow overflow-y-auto pb-20 h-[60vh]">
      <h2 className="font-semibold">Conteúdos vinculados</h2>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {selectedContents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            Nenhum conteúdo selecionado.
          </p>
        ) : (
          selectedContents.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 relative group justify-between border-b border-gray-300"
            >
              {/* Preview */}
              {c.content_type === "image" ? (
                <img
                  src={`${baseUrl}${c.file_path}`}
                  alt="preview"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                  {c.content_type.toUpperCase()}
                </div>
              )}

              {/* Infos */}
              <div className="flex-1">
                <p className="text-sm text-gray-700 line-clamp-1">
                  {c.prompt || "Sem título"}
                </p>
                <span className="text-xs text-gray-400">
                  {c.model_used}
                </span>
              </div>

              {/* Remover */}
              <button
                onClick={() => onRemove(c.id)}
                className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}