import { Bell, User, Search, Settings, LogOut, CreditCard, HelpCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Extrai o nome do arquivo da foto do perfil
  const perfilPhoto = user?.perfil_photo;
  let perfilPhotoFilename = null;
  if (perfilPhoto && typeof perfilPhoto === "string") {
    perfilPhotoFilename = perfilPhoto.replace(/\\/g, "/").split("/").pop();
  }

  // Fecha menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white w-full relative z-50">
      {/* Input de busca */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar projetos, conteúdo..."
          className="w-xs pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
        />
      </div>

      {/* Notificações e Perfil */}
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <div className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition">
          <Bell className="w-4 h-4 text-black" />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.full_name || "Usuário"}</p>
          <p className="text-xs text-gray-500">{user?.email || "email@exemplo.com"}</p>
        </div>

        {/* Foto do perfil com clique para abrir menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 hover:shadow-md transition focus:outline-none"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="Abrir menu do usuário"
          type="button"
        >
          {perfilPhotoFilename ? (
            <img
              src={`${API_BASE_URL}/static/uploads/${perfilPhotoFilename}`}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </button>

        {/* Menu dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-full translate-y-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-fadeIn origin-top-right text-sm z-50">
            <ul>
              <li>
                <a href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <User className="w-4 h-4 text-gray-600" />
                  Perfil
                </a>
              </li>
              <li>
                <a href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <Settings className="w-4 h-4 text-gray-600" />
                  Configurações
                </a>
              </li>
              <li>
                <a href="/plans" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  Planos e Assinaturas
                </a>
              </li>
              <li className="px-4 py-2 text-gray-700">
                Tokens: <span className="font-semibold">{user?.tokens_available ?? 0}</span>
              </li>
              <li>
                <a href="/help" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <HelpCircle className="w-4 h-4 text-gray-600" />
                  Ajuda
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-100 text-red-600 transition font-semibold"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}