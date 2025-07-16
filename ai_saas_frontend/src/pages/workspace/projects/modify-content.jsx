import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import styles from "./projects.module.css";
import { toast } from "react-toastify";
import {
  projectRoutes,
  generatedContentRoutes,
} from "../../../services/apiRoutes";
import { FileText, Image, Video, ArrowLeft, Search, X } from "lucide-react";

const TAB_TYPES = ["text", "image", "video"];

export default function ModifyContent() {
  const { id: projectId } = useParams();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allContents, setAllContents] = useState([]);
  const [project, setProject] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [originalContents, setOriginalContents] = useState([]);
  const [activeTab, setActiveTab] = useState("text"); 
  const [searchTerm, setSearchTerm] = useState("");

  // Função para truncar texto
  function truncate(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resContents = await fetch(generatedContentRoutes.list, {
          credentials: "include",
        });
        if (!resContents.ok) throw new Error("Erro ao buscar conteúdos");
        const contents = await resContents.json();

        const resProject = await fetch(projectRoutes.get(projectId), {
          credentials: "include",
        });
        if (!resProject.ok) throw new Error("Erro ao buscar projeto");
        const projectData = await resProject.json();

        const projectContentIds = projectData.contents.map(c =>
          typeof c === "string" ? c : c.id
        );

        const projectContents = contents.filter(c => projectContentIds.includes(c.id));

        setAllContents(contents);
        setProject(projectData);
        setSelectedContents(projectContents);
        setOriginalContents(projectContents);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  const filteredContents = useMemo(() => {
    return allContents
      .filter(c => c.content_type === activeTab)
      .filter(c => !selectedContents.some(sel => sel.id === c.id))
      .filter(c => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          (c.prompt && c.prompt.toLowerCase().includes(searchLower)) ||
          (c.content_data &&
            typeof c.content_data === "string" &&
            c.content_data.toLowerCase().includes(searchLower))
        );
      });
  }, [allContents, activeTab, searchTerm, selectedContents]);

  function handleAddTemp(content) {
    setSelectedContents(prev => [...prev, content]);
  }

  function handleRemoveTemp(content) {
    setSelectedContents(prev => prev.filter(c => c.id !== content.id));
  }

  async function handleSaveChanges() {
    if (saving) return;
    setSaving(true);
    try {
      const selectedIds = selectedContents.map(c => c.id);

      const res = await fetch(projectRoutes.updateContents(projectId), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_ids: selectedIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar alterações");
      }

      toast.success("Alterações salvas com sucesso!");
      setOriginalContents([...selectedContents]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderContentPreview(content) {
    if (content.content_type === "text") {
      return (
        <div className="text-xs text-gray-700 line-clamp-3">
          {truncate(content.content_data || content.prompt, 200) || "Sem preview"}
        </div>
      );
    }
    if (content.content_type === "image") {
      return (
        <img
          src={`${baseUrl}${content.file_path}`}
          alt={content.prompt || "Imagem gerada"}
          className="w-full h-32 object-cover rounded"
        />
      );
    }
    if (content.content_type === "video") {
      return (
        <video
          src={`${baseUrl}${content.file_path}`}
          controls
          className="w-full h-32 rounded object-cover"
          preload="metadata"
        />
      );
    }
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <p className="p-4 text-sm">Carregando conteúdos...</p>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <p className="p-4 text-red-500">Projeto não encontrado.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className={styles.returnLink}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        <nav className="flex items-center text-sm space-x-1">
          <Link to="/workspace/projects" className="text-gray-700 hover:text-black">
            Projetos
          </Link>
          <span>/</span>
          <span className="text-gray-500">{project.name}</span>
          <span>/</span>
          <span className="text-gray-500">Modificar Conteúdo</span>
        </nav>
      </div>

      {/* Conteúdo principal */}
      <section className="flex space-x-6 mt-6">
        {/* Coluna esquerda: abas + lista conteúdos */}
        <div className="flex-1 flex flex-col">
          {/* Abas */}
          <div className="flex space-x-4 border-b border-gray-300 mb-4">
            {TAB_TYPES.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab === "text"
                  ? "Textos"
                  : tab === "image"
                  ? "Imagens"
                  : "Vídeos"}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="search"
              placeholder="Buscar conteúdos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 bg-white rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
            />
          </div>

          {/* Lista conteúdos */}
          <div className="overflow-y-auto mt-4" style={{ maxHeight: "600px" }}>
            {filteredContents.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">Nenhum conteúdo encontrado.</p>
            )}
            <div className="grid grid-cols-1 gap-4">
              {filteredContents.map(content => (
                <div
                  key={content.id}
                  className="border border-gray-300 rounded p-3 flex flex-col"
                >
                  <div className="mb-2 flex items-center space-x-2 text-gray-700">
                    {content.content_type === "text" && <FileText />}
                    {content.content_type === "image" && <Image />}
                    {content.content_type === "video" && <Video />}
                    <span className="font-semibold">
                      {truncate(content.prompt, 40) || "Sem título"}
                    </span>
                  </div>

                  <div className="mb-3">{renderContentPreview(content)}</div>

                  <button
                    onClick={() => handleAddTemp(content)}
                    className="py-1 px-2 rounded text-sm font-medium transition bg-green-600 text-white hover:bg-green-700"
                  >
                    Adicionar à seleção
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel lateral direito */}
        <aside
          className="w-80 border border-gray-300 rounded p-4 overflow-y-auto bg-white"
          style={{ maxHeight: "700px" }}
        >
          <h2 className="font-semibold mb-4">Conteúdos vinculados</h2>

          {selectedContents.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhum conteúdo selecionado.</p>
          )}

          <ul className="space-y-3">
            {selectedContents.map(content => (
              <li
                key={content.id}
                className="flex items-center justify-between space-x-2 border-b border-gray-200 pb-2"
              >
                <div className="flex items-center space-x-2">
                  {content.content_type === "text" && <FileText />}
                  {content.content_type === "image" && (
                    <img
                      src={`${baseUrl}${content.file_path}`}
                      alt={content.prompt || "Imagem"}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  {content.content_type === "video" && (
                    <video
                      src={`${baseUrl}${content.file_path}`}
                      className="w-16 h-10 rounded object-cover"
                      muted
                      preload="metadata"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {truncate(content.prompt, 30) || "Sem título"}
                  </span>
                </div>

                {/* Botão remover */}
                <button
                  onClick={() => handleRemoveTemp(content)}
                  className="text-red-500 hover:text-red-700"
                  title="Remover da seleção"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          {/* Botão salvar */}
          {selectedContents.length >= 0 && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          )}
        </aside>
      </section>
    </Layout>
  );
}