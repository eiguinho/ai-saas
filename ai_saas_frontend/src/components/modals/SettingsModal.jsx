import { X } from "lucide-react";

export default function SettingsModal({ isOpen, onClose, title, description, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
      <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        {description && <p className="text-sm text-gray-600 mb-4 mt-4">{description}</p>}

        {children}
      </div>
    </div>
  );
}