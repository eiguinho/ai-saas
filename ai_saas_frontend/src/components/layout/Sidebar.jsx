import {
  LayoutDashboard,
  FileText,
  Image,
  Video,
  CreditCard,
  User,
  Settings
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Geração de Texto", icon: FileText, path: "/text-generation" },
  { label: "Geração de Imagem", icon: Image, path: "/image-generation" },
  { label: "Geração de Vídeo", icon: Video, path: "/video-generation" },
  { label: "Assinatura", icon: CreditCard, path: "/subscription" },
  { label: "Perfil", icon: User, path: "/profile" },
  { label: "Configurações", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  return (
    <aside className="w-64 bg-primary px-4 top-0 left-0 h-screen flex flex-col justify-between">
      <div>
        <img src="/static/artificiall/white_Hor_RGB.png" alt="Logo" className="w-64 h-autow px-2 py-6" />
        <nav className="space-y-2">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition ${
                  isActive ? "bg-primary-dark/40 text-white" : ""
                }`}
              >
                <Icon className="w-5 h-5 text-white/90" />
                <span className="text-base font-normal text-white/90">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-blue-500 py-4 text-sm">
        <p className="text-sm text-left text-white/60 py-1">
          Plano: <strong className="text-white/70">{user?.plan || "Básico"}</strong>
        </p>
        <p className="text-xs text-left text-blue-200/80">{user
            ? `${user?.tokens_available ?? 0}/${user.tokensLimit || 1000} tokens usados`
            : "0/1000 tokens usados"}</p>
      </div>
    </aside>
  );
}