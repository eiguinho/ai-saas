import { createContext, useContext, useState, useCallback } from "react";
import { notificationRoutes } from "../services/apiRoutes";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(notificationRoutes.list, { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao buscar notificações");
      const data = await res.json();

      setNotifications(data.notifications || []);
      setUnreadCount((data.notifications || []).filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, setNotifications, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);