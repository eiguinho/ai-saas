import { CheckSquare, XSquare } from "lucide-react";

export default function SelectionToggleButton({ selectionMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={selectionMode ? "Cancelar seleção" : "Selecionar vários"}
      className="p-2 rounded-md hover:bg-gray-100 transition"
      title={selectionMode ? "Cancelar seleção" : "Selecionar vários"}
    >
      {selectionMode ? (
        <XSquare className="w-5 h-5 text-red-500" />
      ) : (
        <CheckSquare className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}