import { useEffect, useState } from "react";
import styles from "./home.module.css";
import Layout from "../../components/layout/Layout";
import { Plus, TrendingUp, Image, Video, FileText, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { projectRoutes } from "../../services/apiRoutes";
import { generatedContentRoutes } from "../../services/apiRoutes";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectsThisMonth, setProjectsThisMonth] = useState(0);

  const [contents, setContents] = useState([]);
  const [contentsThisMonth, setContentsThisMonth] = useState(0);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loadingProject, setLoadingProject] = useState(false);
  const [errorProject, setErrorProject] = useState("");
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch(projectRoutes.list, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar projetos");

      setProjects(data);

      const now = new Date();
      const thisMonthCount = data.filter((p) => {
        const createdAt = new Date(p.created_at);
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }).length;
      setProjectsThisMonth(thisMonthCount);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchContents = async () => {
    try {
      const res = await fetch(generatedContentRoutes.list, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar conteúdos");

      setContents(data);

      // Filtrar os criados no mês atual
      const now = new Date();
      const thisMonthCount = data.filter((c) => {
        const createdAt = new Date(c.created_at);
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }).length;

      setContentsThisMonth(thisMonthCount);
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

      // Fecha modal e limpa
      setShowProjectModal(false);
      setProjectName("");
      setProjectDescription("");

      navigate(`/workspace/projects/${newProjectId}/modify-content`, { replace: true });
    } catch (err) {
      setErrorProject(err.message);
    } finally {
      setLoadingProject(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchContents();
    }
  }, [user]);

useEffect(() => {
  if (createdProjectId) {
    navigate(`/workspace/projects/${createdProjectId}/modify-content`, { replace: true });
  }
}, [createdProjectId, navigate]);

  return (
    <Layout>
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className="text-gray-600">Bem-vindo à sua plataforma de IA generativa</p>
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className={`${styles.btnBlack} ${styles.btnBlackStandard}`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Novo Projeto</span>
          </button>
        </div>

        <div className={styles.panelGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Tokens Usados</p>
              <TrendingUp className="w-4 h-4 text-gray-medium" />
            </div>
            <p className="text-2xl font-bold">{user?.tokens_available ?? 0}</p>
            <p className={`${styles.statSubtext} text-xs`}>
              de {user?.tokensLimit || 1000} tokens disponíveis
            </p>
          </div>

          <div
            className={`${styles.statCard} cursor-pointer hover:opacity-80`}
            onClick={() => navigate("/workspace/projects")}
          >
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Projetos</p>
              <FileText className="w-4 h-4 text-gray-medium" />
            </div>
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className={`${styles.statSubtext} text-xs`}>
              +{projectsThisMonth} novos este mês
            </p>
          </div>

          <div
            className={`${styles.statCard} cursor-pointer hover:opacity-80`}
            onClick={() => navigate("/workspace/generated-contents")}
          >
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Conteúdo Gerado</p>
              <Image className="w-4 h-4 text-gray-medium" />
            </div>
            <p className="text-2xl font-bold">{contents.length}</p>
            <p className={`${styles.statSubtext} text-xs`}>+{contentsThisMonth} criados este mês</p>
          </div>
        </div>

        <div>
          <h1 className={styles.subTitle}>Ferramentas de IA</h1>
          <div className={styles.panelGrid}>
            <div className={styles.statCard}>
              <div>
                <div className="bg-primary w-fit p-3 rounded-lg mb-4">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-black mb-1">Geração de Texto</h3>
                <p className={`${styles.statSubtext} text-sm`}>Crie conteúdo usando LLMs avançados</p>
              </div>
              <Link to="/text-generation" className={`${styles.btnBlack} ${styles.btnBlackWide}`}>
                Começar
              </Link>
            </div>

            <div className={styles.statCard}>
              <div>
                <div className="bg-accent-purple w-fit p-3 rounded-lg mb-4">
                  <Image className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-black mb-1">Geração de Imagem</h3>
                <p className={`${styles.statSubtext} text-sm`}>Gere imagens a partir de prompts</p>
              </div>
              <Link to="/image-generation" className={`${styles.btnBlack} ${styles.btnBlackWide}`}>
                Começar
              </Link>
            </div>

            <div className={styles.statCard}>
              <div>
                <div className="bg-success w-fit p-3 rounded-lg mb-4">
                  <Video className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-black mb-1">Geração de Vídeo</h3>
                <p className={`${styles.statSubtext} text-sm`}>Crie vídeos com IA generativa</p>
              </div>
              <Link to="/video-generation" className={`${styles.btnBlack} ${styles.btnBlackWide}`}>
                Começar
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className={styles.subTitle}>Projetos Recentes</h2>
          <div
            className={`${styles.blockCard} divide-y divide-gray-300 cursor-pointer`}
            onClick={() => navigate("/workspace/projects")}
          >
            {projects.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-black mb-1">{item.name}</p>
                  <p className={`${styles.statSubtext} text-sm`}>
                    {item.description || "Sem descrição"}
                  </p>
                </div>
                <p className={`${styles.statSubtext} text-sm`}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}

            {projects.length === 0 && (
              <p className="text-sm text-gray-500 p-4">
                Nenhum projeto ainda. Clique em “Novo Projeto” para começar!
              </p>
            )}
          </div>
        </div>
      </section>

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

export default Home;