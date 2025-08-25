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

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const data = await res.json();

    const fixedNotifications = (data.notifications || []).map((n) => ({
      ...n,
      created_at: fixDateString(n.created_at),
    }));

    setNotifications(fixedNotifications);
    setUnreadCount(fixedNotifications.filter((n) => !n.is_read).length);
  } catch (err) {
    console.error("Erro ao buscar notifications:", err);
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
