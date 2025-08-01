import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { projectRoutes } from "../../../services/apiRoutes";

export default function useProjectsFetch() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(projectRoutes.list, { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao carregar projetos");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((p) => {
      const s = searchTerm.toLowerCase();
      if (!searchTerm) return true;
      return (
        p.name?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s)
      );
    });

    if (dateFilter) {
      const now = new Date();
      filtered = filtered.filter((p) => {
        const created = new Date(p.created_at);
        if (dateFilter === "7days") {
          return now - created <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "30days") {
          return now - created <= 30 * 24 * 60 * 60 * 1000;
        } else return true;
      });
    }

    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [projects, searchTerm, dateFilter, sortBy]);

  return {
    loading,
    projects: filteredProjects,
    rawProjects: projects,
    loadProjects,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,
    setProjects
  };
} 