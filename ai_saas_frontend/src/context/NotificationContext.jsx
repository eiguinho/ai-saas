import { createContext, useContext, useState, useCallback } from "react";
import { notificationRoutes } from "../services/apiRoutes";
import { fixDateString } from "../utils/dateUtils";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(notificationRoutes.list, { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao buscar notificações");
      const data = await res.json();

      // Corrige as datas antes de salvar no estado
      const fixedNotifications = (data.notifications || []).map((n) => ({
        ...n,
        created_at: fixDateString(n.created_at),
      }));

      setNotifications(fixedNotifications);
      setUnreadCount(fixedNotifications.filter((n) => !n.is_read).length);
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
