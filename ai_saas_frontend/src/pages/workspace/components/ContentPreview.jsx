export default function ContentPreview({ content, isModal = false }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const baseClasses = "object-contain rounded";

  if (content.content_type === "text") {
    const text = content.content_data || content.prompt;
    const displayText = isModal ? text : text?.length > 150 ? text.substring(0, 150) + "..." : text;

    return <div className={`text-xs text-gray-700 ${isModal ? "whitespace-pre-wrap break-words" : "line-clamp-3"}`}>{displayText}</div>;
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
        <img
          src={`${baseUrl}${content.file_path}`}
          alt={content.prompt || "Imagem gerada"}
          className={
            isModal
              ? `${baseClasses} max-w-full max-h-[400px]`
              : `${baseClasses} w-full`
          }
        />
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
          src={`${baseUrl}${content.file_path}`}
          controls
          className={
            isModal
              ? `${baseClasses} max-w-full max-h-full`
              : `${baseClasses} w-full`
          }
          preload="metadata"
        />
      </div>
    );
  }

  return null;
}