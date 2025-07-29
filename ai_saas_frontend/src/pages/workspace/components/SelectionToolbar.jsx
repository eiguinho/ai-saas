export default function SelectionToolbar({ count, confirmLabel, onConfirm, confirmColor = "blue", icon = null }) {
  if (count === 0) return null;

  const bgColor = confirmColor === "red" ? "bg-red-600" : "bg-blue-600";
  const hoverColor = confirmColor === "red" ? "hover:bg-red-700" : "hover:bg-blue-700";
  const focusRing = confirmColor === "red" ? "focus:ring-red-400" : "focus:ring-blue-400";

  return (
    <div
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2
        flex items-center gap-6
        bg-white bg-opacity-30 backdrop-blur-md
        border border-gray-300 border-opacity-40
        shadow-2xl
        rounded-3xl
        px-8 py-2.5
        z-[9999]
        transition-opacity duration-300
      "
      role="region"
      aria-live="polite"
      aria-label="Barra de ações de seleção"
    >
      <span className="text-sm font-semibold text-gray-800 drop-shadow-sm">
        {count} selecionado{count > 1 ? "s" : ""}
      </span>
      <button
        onClick={onConfirm}
        className={`${bgColor} ${hoverColor} text-white font-bold rounded-full px-5 py-1.5 flex items-center gap-2 shadow-md transition select-none focus:outline-none focus:ring-4 focus:ring-offset-2 ${focusRing}`}
      >
        {icon && <span className="w-5 h-5">{icon}</span>}
        {confirmLabel}
      </button>
    </div>
  );
}