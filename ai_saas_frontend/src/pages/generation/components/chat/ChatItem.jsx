import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Edit2, Trash2, Archive, CornerUpLeft } from "lucide-react";
import { toast } from "react-toastify";
import { chatRoutes } from "../../../../services/apiRoutes";

export default function ChatItem({ chat, selected, loadChat, onUpdateList }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        !e.target.closest(".chat-dropdown")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 120;
    const viewportHeight = window.innerHeight;

    let top;
    top = rect.bottom + dropdownHeight > viewportHeight ? rect.top - dropdownHeight - 4 : rect.bottom + 4;

    setDropdownPos({ top, left: rect.right - 144 });
    setOpen((prev) => !prev);
  };

  const handleRename = async () => {
    try {
      const res = await fetch(`${chatRoutes.list}${chat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Chat renomeado!");
        onUpdateList(chat, "rename", newTitle); // apenas atualiza a lista
        setRenaming(false);
        setOpen(false);
      } else throw new Error(data.error || "Erro ao renomear");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente deletar este chat?")) return;
    try {
      const res = await fetch(`${chatRoutes.list}${chat.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Chat deletado!");
        onUpdateList(chat, "delete"); // remove da lista e limpa seleção se for o chat atual
      } else {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleArchiveToggle = async () => {
    try {
      const endpoint = chat.archived
        ? `${chatRoutes.list}${chat.id}/unarchive`
        : `${chatRoutes.list}${chat.id}/archive`;

      const res = await fetch(endpoint, { method: "PATCH", credentials: "include" });

      if (res.ok) {
        const action = chat.archived ? "unarchive" : "archive";
        toast.success(`Chat ${action === "archive" ? "arquivado" : "desarquivado"}!`);
        onUpdateList(chat, action); // apenas atualiza a lista, não muda o chat atual
      } else {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar status do chat");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between px-3 py-2 mb-1 rounded-md text-sm truncate ${
        selected ? "bg-[var(--color-primary)] text-white" : "hover:bg-gray-100 text-gray-800"
      }`}
      title={chat.title}
    >
      <div className="flex items-center w-full rounded-md group" onClick={() => loadChat(chat.id)}>
        <div className="flex-1 min-w-0 cursor-default">
          {renaming ? (
            <input
              className="w-full text-sm rounded-md border border-gray-300 focus:outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          ) : (
            <span className="truncate block text-sm">{chat.title}</span>
          )}
        </div>

        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button ref={buttonRef} className="p-1 rounded cursor-pointer" onClick={toggleDropdown}>
            <MoreVertical className={`w-4 h-4 ${selected ? "text-white" : "text-gray-500"}`} />
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <div
            className="chat-dropdown bg-white border border-gray-200 rounded-md shadow-lg w-36 z-[1000]"
            style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setRenaming(true); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm"
            >
              <Edit2 className="w-4 h-4" /> Renomear
            </button>

            <button
              onClick={handleArchiveToggle}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm"
            >
              {chat.archived ? (
                <>
                  <CornerUpLeft className="w-4 h-4" /> Desarquivar
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" /> Arquivar
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm text-red-500"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
