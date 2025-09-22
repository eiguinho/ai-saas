import { useState, useRef, useEffect } from "react";
import { Plus, Search, File, FolderMinus, Folder, MessageSquare } from "lucide-react";
import ChatItem from "./ChatItem";
import useChatSearch from "../../hooks/useChatSearch";

export default function Sidebar({ chats, chatId, loadChat, createNewChat, updateChatList, setImagesOpen }) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const archived = chats.filter((c) => c.archived);
  const active = chats.filter((c) => !c.archived);

  const { query, results, handleChange, loading } = useChatSearch();

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = (chat) => {
    loadChat(chat.id);
    setImagesOpen(false);
    setSearchOpen(false);
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col p-3 h-full overflow-y-auto">
      {/* Ações */}
      <div className="flex flex-col gap-3 mb-4 mt-[5rem]">
        {/* Novo Chat e Arquivos */}
        <div className="flex justify-between items-start">
          {/* Novo Chat */}
          <button
            onClick={() => {
              createNewChat();
              setImagesOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-[var(--color-primary)] text-white shadow-sm hover:brightness-105 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm mr-2">Novo Chat</span>
          </button>

          {/* Arquivos */}
          <button
            onClick={() => setImagesOpen(true)} // controla o state no componente pai
            className="flex flex-col items-center px-3 py-2 rounded-xl bg-gray-50 text-gray-900 shadow-sm hover:brightness-105 transition"
          >
            <File className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Gerações</span>
          </button>
        </div>

        {/* Buscar em chats */}
        <div className="relative mt-2" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              handleChange(e);
              setSearchOpen(true);
            }}
            placeholder="Buscar em chats..."
            className="w-full pl-9 px-5 py-2 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 overflow-y-auto shadow-sm focus:outline-none focus:shadow-md"
          />

          {searchOpen && (
            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fadeIn origin-top">
              {loading ? (
                <p className="p-3 text-sm text-gray-500">Buscando...</p>
              ) : results.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto divide-y divide-gray-200">
                  {results.map((chat) => (
                    <li
                      key={chat.id}
                      onClick={() => handleSearchClick(chat)}
                      className="flex flex-col gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {chat.archived ? (
                          <Folder className="w-4 h-4 text-gray-400" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="flex-1 text-sm truncate">{chat.title}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(chat.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {chat.snippet && (
                        <p
                          className="text-xs text-gray-500 truncate"
                          dangerouslySetInnerHTML={{ __html: chat.snippet }}
                        ></p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-3 text-sm text-gray-500">Nenhum resultado</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Chats Ativos */}
      <h2 className="font-semibold text-gray-700 mb-2 text-sm">Chats</h2>
      <div className="flex-1 overflow-y-auto pr-1">
        {active.length === 0 && <p className="text-sm text-gray-400 px-3">Nenhum chat</p>}
        {active.map((c) => (
          <ChatItem
            key={c.id}
            chat={c}
            selected={chatId === c.id}
            loadChat={() => {
              loadChat(c.id);
              setImagesOpen(false); // fechar as gerações
            }}
            onUpdateList={updateChatList}
          />
        ))}

        {/* Chats Arquivados */}
        {archived.length > 0 && (
          <div className="mt-4">
            <button
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setShowArchived((prev) => !prev)}
            >
              <FolderMinus className="w-4 h-4" />
              {showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}
            </button>

            {showArchived && (
              <div className="mt-2 space-y-1">
                {archived.map((c) => (
                  <ChatItem
                    key={c.id}
                    chat={c}
                    selected={chatId === c.id}
                    loadChat={() => {
                      loadChat(c.id);
                      setImagesOpen(false); // fechar as gerações
                    }}
                    onUpdateList={updateChatList}
                    archived
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
