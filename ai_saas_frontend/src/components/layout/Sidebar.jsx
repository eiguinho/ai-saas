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

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Geração de Texto", icon: FileText, path: "/texto" },
  { label: "Geração de Imagem", icon: Image, path: "/imagem" },
  { label: "Geração de Vídeo", icon: Video, path: "/video" },
  { label: "Assinatura", icon: CreditCard, path: "/assinatura" },
  { label: "Perfil", icon: User, path: "/perfil" },
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 bg-primary px-4 top-0 left-0 h-screen flex flex-col justify-between">
      <div>
        <h2 className="text-xl text-left font-bold px-2 py-6">AI SaaS Platform</h2>
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
          Plano: <strong className="text-white/70">Básico</strong>
        </p>
        <p className="text-xs text-left text-blue-200/80">500/1000 tokens usados</p>
      </div>
    </aside>
  );
}