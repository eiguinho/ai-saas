import { useState, useEffect } from "react";
import { notificationRoutes } from "../../../services/apiRoutes";

export default function useNotificationsFetch() {
  const [notifications, setNotifications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // "7" ou "30"
  const [sortBy, setSortBy] = useState("recent");
  const [selected, setSelected] = useState([]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(notificationRoutes.list, {
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Erro ao carregar notificações", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    let filtered = [...notifications];

    // Busca
    if (searchTerm) {
      filtered = filtered.filter((n) =>
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por data
    if (dateFilter) {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((n) => new Date(n.created_at) >= cutoff);
    }

    // Ordenação
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.message.localeCompare(b.message));
    }

    setFiltered(filtered);
  }, [searchTerm, dateFilter, sortBy, notifications]);

  return {
    loading,
    notifications: filtered,
    selected,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,
    setSelected,
    loadNotifications,
    setNotifications,
  };
}
