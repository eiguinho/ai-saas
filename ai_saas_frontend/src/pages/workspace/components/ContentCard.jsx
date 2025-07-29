import { FileText, Image, Video } from "lucide-react";
import ContentPreview from "./ContentPreview";
import { formatDateTime } from "../../../utils/dateUtils";

export default function ContentCard({ content, onSelect, selectionMode = false, selected = false, onToggleSelect }) {
  return (
    <div className={`relative rounded-lg p-4 bg-white shadow hover:shadow-md transition ${selected ? "ring-2 ring-blue-500" : ""}`}>
      {selectionMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(content)}
          className="absolute top-2 right-2 w-4 h-4 accent-blue-600 cursor-pointer z-20"
        />
      )}
      <div className="cursor-pointer" onClick={() => !selectionMode && onSelect(content)}>
        <div className="flex items-center gap-2 mb-2">
          {content.content_type === "text" && <FileText className="w-4 h-4 text-blue-500" />}
          {content.content_type === "image" && <Image className="w-4 h-4 text-green-500" />}
          {content.content_type === "video" && <Video className="w-4 h-4 text-purple-500" />}
          <span className="text-xs text-gray-600">{formatDateTime(content.created_at)}</span>
        </div>
        <div className="flex-grow">
          <ContentPreview content={content} />
        </div>
        <p className="mt-auto text-xs text-gray-700 pt-2 font-medium">
          Modelo: <span>{content.model_used}</span>
        </p>
      </div>
    </div>
  );
}