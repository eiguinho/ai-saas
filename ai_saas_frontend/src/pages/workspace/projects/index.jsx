import { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import styles from "./projects.module.css";
import { Edit3, PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { projectRoutes } from "../../../services/apiRoutes";
import { Link } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch(projectRoutes.list, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar projetos");

      setProjects(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";

  // Se a string não termina com Z nem tem offset, adiciona Z para indicar UTC
  const isoDateStr = dateStr.match(/Z|[+-]\d{2}:\d{2}$/) ? dateStr : dateStr + "Z";

  const d = new Date(isoDateStr);
  return (
    d.toLocaleDateString("pt-BR") +
    " " +
    d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className={styles.returnLink}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        <nav className="flex items-center text-sm space-x-1">
          <Link to="/" className="text-gray-700 hover:text-black">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-500">Projetos</span>
        </nav>
      </div>

      <section className="space-y-6">
        <h1 className={styles.title}>Meus Projetos</h1>
        <p className="text-gray-600">
          Gerencie seus projetos, edite detalhes ou adicione conteúdos.
        </p>

        <div className={`${styles.blockCard} divide-y divide-gray-300`}>
          {loading && <p className="p-4 text-sm">Carregando...</p>}

          {!loading && projects.length === 0 && (
            <p className="p-4 text-sm text-gray-500">
              Você ainda não criou nenhum projeto.
            </p>
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              className="relative flex items-center justify-between p-4 hover:bg-gray-50"
            >
              {/* Botão de excluir fixado no canto direito */}
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => handleDelete(project.id)}
                title="Excluir projeto"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Informações do projeto */}
              <div>
                <p className="font-semibold text-black mb-1">{project.name}</p>
                <p className={`${styles.statSubtext} text-sm`}>
                  {project.description || "Sem descrição"}
                </p>

                {/* Criado em + Última edição */}
                <div className="flex gap-4 text-xs text-gray-400 mt-1">
                  <span>
                    Criado em {formatDateTime(project.created_at)}
                  </span>
                  <span>
                    Última edição {formatDateTime(project.updated_at)}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                {/* Agora usamos <Link> para edição */}
                <Link
                  to={`/workspace/projects/${project.id}/edit`}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </Link>

                <Link
                  to={`/workspace/projects/${project.id}/modify-content`}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-black text-white hover:opacity-90 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Modificar Conteúdo
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}