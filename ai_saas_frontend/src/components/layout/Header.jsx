import { Bell, User, Search, Settings, LogOut, CreditCard, HelpCircle, Folder, FileText } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useState, useRef, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { projectRoutes, generatedContentRoutes, notificationRoutes } from "../../services/apiRoutes"
import { useNotifications } from "../../context/NotificationContext"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const { notifications, unreadCount, fetchNotifications, setNotifications, setUnreadCount } = useNotifications()
  const menuRef = useRef(null)
  const searchRef = useRef(null)

  const perfilPhoto = user?.perfil_photo
  let perfilPhotoFilename = null
  if (perfilPhoto && typeof perfilPhoto === "string") perfilPhotoFilename = perfilPhoto.replace(/\\/g, "/").split("/").pop()

  const debounce = (fn, delay) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }

  const truncate = (str, length = 50) => {
    if (!str) return ""
    return str.length > length ? str.substring(0, length) + "..." : str
  }

  const fetchSearchResults = useCallback(debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    try {
      const [projRes, contRes] = await Promise.all([
        fetch(`${projectRoutes.list}?q=${query}`, { credentials: "include" }).then(r => r.json()),
        fetch(`${generatedContentRoutes.list}?q=${query}`, { credentials: "include" }).then(r => r.json())
      ])
      const formatted = [
        ...(projRes || []).map(p => ({ type: "project", id: p.id, title: p.name || p.title, created_at: p.created_at })),
        ...(contRes || []).map(c => ({ type: "content", id: c.id, title: truncate(c.prompt || "Conteúdo gerado"), created_at: c.created_at }))
      ]
      setSearchResults(formatted)
      setSearchOpen(true)
    } catch (err) {
      console.error("Erro ao buscar:", err)
    }
  }, 400), [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    fetchSearchResults(value)
  }

  const handleSearchClick = (item) => {
    setSearchQuery("")
    setSearchResults([])
    setSearchOpen(false)
    if (item.type === "project") {
      navigate(`/workspace/projects/${item.id}/modify-content`)
    } else if (item.type === "content") {
      navigate(`/workspace/generated-contents`)
      // Futuro: abrir modal específico
    }
  }


  const markNotificationAsRead = async (notifId) => {
    try {
      await fetch(notificationRoutes.markSingle(notifId), { method: "PATCH", credentials: "include" })
    } catch (err) {
      console.error(`Erro ao marcar notificação ${notifId} como lida:`, err)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n)))
      setUnreadCount(prev => Math.max(prev - 1, 0))
      await markNotificationAsRead(notif.id)
    }
    if (notif.link) navigate(notif.link)
  }

  const handleDeleteNotification = async (notifId) => {
    const notifToDelete = notifications.find(n => n.id === notifId)
    setNotifications(prev => prev.filter(n => n.id !== notifId))
    if (notifToDelete && !notifToDelete.is_read) setUnreadCount(prev => Math.max(prev - 1, 0))
    try {
      const res = await fetch(notificationRoutes.delete(notifId), { method: "DELETE", credentials: "include" })
      if (!res.ok) fetchNotifications()
      else fetchNotifications()
    } catch {
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(notificationRoutes.markRead, { method: "PATCH", credentials: "include" })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Erro ao marcar todas notificações como lidas:", err)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleOpenNotif = () => {
    setNotifOpen(prev => !prev)
    setMenuOpen(false)
  }

  function NotificationItem({ notif }) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    return (
      <li className={`px-4 py-3 transition flex flex-col items-start space-y-1 hover:bg-gray-100 ${notif.is_read ? "text-gray-400 bg-white" : "text-gray-800 bg-gray-50"}`}>
        {!confirmDelete ? (
          <>
            <div className="flex justify-between items-start w-full">
              {notif.link ? (
                <button onClick={() => handleNotificationClick(notif)} className="text-left font-medium">{notif.message}</button>
              ) : (
                <p className="text-sm">{notif.message}</p>
              )}
              <button onClick={() => setConfirmDelete(true)} className="ml-2 text-gray-400 hover:text-red-500" title="Excluir notificação">✕</button>
            </div>
            <span className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString("pt-BR")}</span>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-sm font-semibold transition duration-200">
            <span className="text-red-600">Tem certeza que deseja excluir?</span>
            <div className="flex gap-2">
              <button onClick={() => { handleDeleteNotification(notif.id); setConfirmDelete(false) }} className="px-2 py-1 rounded hover:bg-red-100 text-red-600 transition">Sim</button>
              <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 rounded hover:bg-gray-100 transition">Não</button>
            </div>
          </div>
        )}
      </li>
    )
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white w-full relative z-50" ref={menuRef}>
      <div className="relative max-w-md w-full" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input value={searchQuery} onChange={handleSearchChange} type="text" placeholder="Buscar projetos, conteúdos..." className="w-xs pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md" />
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fadeIn origin-top">
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-200">
              {searchResults.map(item => (
                <li key={`${item.type}-${item.id}`} onClick={() => handleSearchClick(item)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  {item.type === "project" ? <Folder className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-purple-500" />}
                  <span className="flex-1 text-sm">{item.title}</span>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 relative">
        <div className="relative p-2 rounded-md hover:bg-gray-100 cursor-pointer transition" onClick={handleOpenNotif} aria-label="Abrir notificações" role="button" tabIndex={0}>
          <Bell className="w-4 h-4 text-black" />
          {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full px-1">{unreadCount}</span>}
        </div>

        {notifOpen && (
          <div className="absolute right-16 top-full translate-y-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-fadeIn origin-top-right text-sm z-50">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 text-gray-800 font-semibold">
              <span>Notificações</span>
              {unreadCount > 0 && <button onClick={markAllAsRead} className="text-blue-600 text-xs hover:underline">Marcar tudo como lido</button>}
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Sem notificações</div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-200">
                {notifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)}
              </ul>
            )}
            <div className="border-t border-gray-300">
              <button onClick={() => navigate("/notifications")} className="w-full text-center py-3 text-blue-600 hover:bg-blue-50 transition text-sm font-semibold">Ver todas notificações</button>
            </div>
          </div>
        )}

        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.full_name || "Usuário"}</p>
          <p className="text-xs text-gray-500">{user?.email || "email@exemplo.com"}</p>
        </div>

        <button onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false) }} className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 hover:shadow-md transition focus:outline-none" aria-haspopup="true" aria-expanded={menuOpen} aria-label="Abrir menu do usuário" type="button">
          {perfilPhotoFilename ? <img src={`${API_BASE_URL}/static/uploads/${perfilPhotoFilename}`} alt="Foto de perfil" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100"><User className="w-4 h-4 text-gray-500" /></div>}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full translate-y-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-fadeIn origin-top-right text-sm z-50">
            <ul>
              <li><Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition" onClick={() => setMenuOpen(false)}><User className="w-4 h-4 text-gray-600" />Perfil</Link></li>
              <li><Link to="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition" onClick={() => setMenuOpen(false)}><Settings className="w-4 h-4 text-gray-600" />Configurações</Link></li>
              <li><Link to="/plans" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition" onClick={() => setMenuOpen(false)}><CreditCard className="w-4 h-4 text-gray-600" />Planos e Assinaturas</Link></li>
              <li><Link to="/help" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition" onClick={() => setMenuOpen(false)}><HelpCircle className="w-4 h-4 text-gray-600" />Ajuda</Link></li>
              <li><button onClick={() => { logout(); setMenuOpen(false) }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-100 text-red-600 transition font-semibold" type="button"><LogOut className="w-4 h-4" />Sair</button></li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}