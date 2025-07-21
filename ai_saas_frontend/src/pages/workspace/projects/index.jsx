import { useEffect, useState, useMemo, useRef } from "react";
import Layout from "../../../components/layout/Layout";
import styles from "./projects.module.css";
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit3,
  X,
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { projectRoutes } from "../../../services/apiRoutes";

export default function ProjectsList() {

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loadingProject, setLoadingProject] = useState(false);
  const [errorProject, setErrorProject] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);

  // Dropdowns
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Filtros
  const [dateFilter, setDateFilter] = useState("");

  // Ordenação
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    // Filtro por data
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

    // Ordenação
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [projects, searchTerm, dateFilter, sortBy]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const fixed = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T") + "Z";

    return new Date(fixed).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";

    // Remove microssegundos (tudo depois do segundo ponto)
    const cleaned = dateStr.replace(/\.\d+$/, "");

    // Adiciona Z para interpretar como UTC, caso não tenha
    const fixed = cleaned.endsWith("Z") ? cleaned : cleaned + "Z";

    return new Date(fixed).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este projeto?")) return;

    try {
      const res = await fetch(projectRoutes.delete(id), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir projeto");

      toast.success("Projeto excluído com sucesso!");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  const createProject = async () => {
    if (!projectName.trim()) {
      setErrorProject("O nome do projeto é obrigatório.");
      return;
    }

    setLoadingProject(true);
    setErrorProject("");

    try {
      const res = await fetch("/api/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao criar projeto");
      }

      const data = await res.json();
      const newProjectId = data.id || data.project?.id;

      if (!newProjectId) {
        throw new Error("ID do projeto não encontrado na resposta da API");
      }
      toast.success("Projeto criado com sucesso!");

      await loadProjects();

      // Fecha modal e limpa
      setShowProjectModal(false);
      setProjectName("");
      setProjectDescription("");
    } catch (err) {
      setErrorProject(err.message);
    } finally {
      setLoadingProject(false);
    }
  };

  return (
    <Layout>
      <h1 className={styles.title}>Meus Projetos</h1>
      <p className="text-gray-600 mb-6">
        Gerencie seus projetos, edite detalhes ou adicione conteúdos.
      </p>

      {/* Barra de busca + filtros + botão novo projeto */}
      <div className="flex items-center justify-between mb-4">
        {/* Busca */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 bg-white rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 items-center">
          {/* Filtro */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50 animate-fadeIn">
                <h3 className="text-sm font-semibold mb-2">Filtros</h3>

                {/* Filtro por data */}
                <label className="block text-xs text-gray-600 mb-1">Data</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-gray-50 rounded px-2 py-1 shadow-sm text-sm focus:outline-none"
                >
                  <option value="">Todas</option>
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                </select>

                <button
                  onClick={() => setDateFilter("")}
                  className="w-full text-xs text-gray-600 hover:underline mt-4"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>

          {/* Ordenar */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <ArrowUpDown className="w-5 h-5 text-gray-700" />
            </button>
            {sortMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden text-sm z-50">
                <button
                  onClick={() => {
                    setSortBy("newest");
                    setSortMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Mais recentes
                </button>
                <button
                  onClick={() => {
                    setSortBy("oldest");
                    setSortMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Mais antigos
                </button>
                <button
                  onClick={() => {
                    setSortBy("name");
                    setSortMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Por nome
                </button>
              </div>
            )}
          </div>

          {/* Novo Projeto */}
          <button
            onClick={() => setShowProjectModal(true)}
            className={`${styles.btnBlack} ${styles.btnBlackStandard}`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Lista de projetos */}
      {loading ? (
        <p className="mt-6 text-sm">Carregando projetos...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="mt-6 text-gray-500 text-sm">
          Nenhum projeto encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col rounded-lg p-4 bg-white shadow hover:shadow-md transition cursor-pointer relative"
              onClick={() => setSelectedProject(project)}
            >
              {/* Botão excluir flutuante */}
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex-grow">
                <h2 className="font-semibold text-black mb-1">{project.name}</h2>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {project.description || "Sem descrição"}
                </p>
              </div>

              <div className="mt-auto flex gap-2 text-xs text-gray-500 pt-2">
              <span>Criado: {formatDate(project.created_at)}</span>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
          <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {selectedProject.name}
            </h2>
            <p className="text-sm text-gray-700">
              {selectedProject.description || "Sem descrição"}
            </p>
            <div className="mt-4 text-sm text-gray-700 space-y-2">
              <p>
                <strong>Criado em:</strong>{" "}
                {formatDateTime(selectedProject.created_at)}
              </p>
              <p>
                <strong>Última edição:</strong>{" "}
                {formatDateTime(selectedProject.updated_at)}
              </p>
            </div>

            {/* Ações no modal */}
              <div className="flex justify-between items-center mt-8">
                <Link
                  to={`/workspace/projects/${selectedProject.id}/edit`}
                  className="flex items-center gap-1 px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </Link>

                <Link
                  to={`/workspace/projects/${selectedProject.id}/modify-content`}
                  className="flex items-center gap-1 px-4 py-2 text-sm rounded-md bg-black text-white hover:opacity-90 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Ajustar Conteúdos
                </Link>
              </div>
          </div>
        </div>
      )}
      {showProjectModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
                <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                    onClick={() => setShowProjectModal(false)}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
      
                  <h2 className={styles.subTitle}>Novo Projeto</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Dê um nome e uma breve descrição para organizar seu conteúdo.
                  </p>
      
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      placeholder="Ex: Campanha de Marketing"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full mt-1 pl-3 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
                    />
                  </div>
      
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      placeholder="Descrição opcional..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full mt-1 pl-3 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
                      rows="3"
                    />
                  </div>
      
                  {errorProject && (
                    <p className="text-sm text-red-500 mb-2">{errorProject}</p>
                  )}
      
                  <div className="flex justify-end">
                    <button
                      onClick={createProject}
                      disabled={loadingProject}
                      className="bg-black text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition"
                    >
                      {loadingProject ? "Criando..." : "Criar Projeto"}
                    </button>
                  </div>
                </div>
              </div>
            )}
    </Layout>
  );
}