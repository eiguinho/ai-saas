import { Bell, User, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white w-full">
      {/* Input de busca com ícone */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar projetos, conteúdo..."
          className="w-xs pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
        />
      </div>

      {/* Notificações e Perfil */}
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition">
          <Bell className="w-4 h-4 text-black" />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.full_name || "Usuário"}</p>
          <p className="text-xs text-gray-500">{user?.email || "email@exemplo.com"}</p>
        </div>
        <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition">
          <User className="w-4 h-4 text-black" />
        </div>
      </div>
    </header>
  );
}