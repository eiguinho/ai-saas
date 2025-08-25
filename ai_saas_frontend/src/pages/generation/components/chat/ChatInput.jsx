import React, { useRef, useEffect } from "react";
import { Send, Paperclip, X, Square } from "lucide-react";
import { toast } from "react-toastify";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "application/pdf"];

export default function ChatInput({ 
  input, 
  setInput, 
  handleSend, 
  handleStop, 
  loading, 
  files, 
  setFiles, 
  attachmentsAllowed 
}) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const maxHeight = 160; // altura máxima em pixels

  const handleFileChange = (e) => {
    if (!attachmentsAllowed) {
      toast.warning("Este modelo não suporta anexos.");
      return;
    }
    const newFiles = Array.from(e.target.files);
    const filtered = newFiles.filter(f => allowedTypes.includes(f.type));
    if (filtered.length < newFiles.length) {
      toast.warning("Alguns arquivos foram ignorados, apenas jpeg, png, gif e pdf são aceitos");
    }
    setFiles(prev => [...prev, ...filtered]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
    }
  }, [input]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
            >
              {file.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-12 h-12 object-cover rounded" />
              ) : (
                <span>{file.name}</span>
              )}
              <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => attachmentsAllowed && fileInputRef.current.click()}
          className={`p-3 rounded-xl hover:bg-gray-100 transition shadow ${!attachmentsAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
          title={attachmentsAllowed ? "Anexar arquivo" : "Este modelo não suporta anexos"}
        >
          <Paperclip className="w-6 h-6 text-gray-600" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          hidden
          accept=".jpeg,.jpg,.png,.gif,.pdf"
        />

        <textarea
          ref={textareaRef}
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !loading) {
              e.preventDefault();
              handleSend();
              setInput("");
              setFiles([]);
            }
          }}
          rows={1}
          className="flex-1 resize-none px-5 py-3 rounded-3xl bg-gray-50 text-gray-900 placeholder-gray-400 overflow-y-auto shadow-sm focus:outline-none focus:shadow-md"
          style={{ maxHeight: maxHeight + "px" }}
        />

        {loading ? (
          <button
            onClick={handleStop}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-3xl flex items-center justify-center transition"
          >
            <Square className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            className="p-3 bg-[var(--color-primary)] hover:bg-blue-500 text-white rounded-3xl flex items-center justify-center transition"
          >
            <Send className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
