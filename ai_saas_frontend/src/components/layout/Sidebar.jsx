import {
  LayoutDashboard,
  FileText,
  Image,
  Video,
  CreditCard,
  User,
  Settings,
  ShieldCheck,
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

export default function Sidebar({
  collapsed = false,
  chats,
  chatId,
  loadChat,
  createNewChat,
  updateChatList,
}) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={`${
        collapsed ? "w-20 -ml-64" : "w-64 ml-0"
      } bg-primary px-4 h-screen flex flex-col justify-between transition-all duration-300`}
    >
      <div>
        {!collapsed && (
          <img
            src="/static/artificiall/white_Hor_RGB.png"
            alt="Logo"
            className="w-64 h-auto px-2 py-6"
          />
        )}
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
                {!collapsed && (
                  <span className="text-base font-normal text-white/90">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              to="/adm"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition ${
                location.pathname === "/adm" ? "bg-primary-dark/40 text-white" : ""
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-white/90" />
              {!collapsed && (
                <span className="text-base font-normal text-white/90">
                  Painel Administrativo
                </span>
              )}
            </Link>
          )}
        </nav>
      </div>
      <div className="border-t border-blue-500 py-4 text-sm">
        {!collapsed && (
          <>
            <p className="text-sm text-left text-white/60 py-1">
              Plano:{" "}
              <strong className="text-white/70">
                {user?.plan || "Básico"}
              </strong>
            </p>
            <p className="text-xs text-left text-blue-200/80">
              {user
                ? `${user?.tokens_available ?? 0}/${
                    user.tokensLimit || 1000
                  } tokens usados`
                : "0/1000 tokens usados"}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}