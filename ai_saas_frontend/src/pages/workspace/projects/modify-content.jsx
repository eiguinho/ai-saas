import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import styles from "./projects.module.css";
import { toast } from "react-toastify";
import {
  projectRoutes,
  generatedContentRoutes,
} from "../../../services/apiRoutes";
import {
  FileText,
  Image,
  Video,
  ArrowLeft,
  Search,
  X,
  Filter,
  ArrowUpDown,
} from "lucide-react";

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
  const [selectedContentModal, setSelectedContentModal] = useState(null);

  // Dropdowns
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Filtros
  const [filterModel, setFilterModel] = useState("");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterRatio, setFilterRatio] = useState("");
  const [filterTempMin, setFilterTempMin] = useState("");
  const [filterTempMax, setFilterTempMax] = useState("");
  const [filterDurMin, setFilterDurMin] = useState("");
  const [filterDurMax, setFilterDurMax] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Ordenação
  const [sortBy, setSortBy] = useState("newest");

  const TEXT_MODELS = ["GPT-4", "GPT-3.5 Turbo", "Gemini", "Claude"];
  const IMAGE_MODELS = ["DALL-E 3", "Midjourney", "Stable Diffusion"];
  const VIDEO_MODELS = ["Sora", "Runway", "Pika"];
  const IMAGE_STYLES = ["Fotorrealista", "Artístico", "Cartoon"];
  const IMAGE_RATIOS = ["1:1", "16:9", "9:16"];
  const VIDEO_STYLES = ["Realista", "Animado", "Cinematográfico"];

  function truncate(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resContents = await fetch(generatedContentRoutes.list, { credentials: "include" });
        if (!resContents.ok) throw new Error("Erro ao buscar conteúdos");
        const contents = await resContents.json();

        const resProject = await fetch(projectRoutes.get(projectId), { credentials: "include" });
        if (!resProject.ok) throw new Error("Erro ao buscar projeto");
        const projectData = await resProject.json();

        const projectContentIds = projectData.contents.map((c) =>
          typeof c === "string" ? c : c.id
        );

        const projectContents = contents.filter((c) => projectContentIds.includes(c.id));

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

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterMenuOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredContents = useMemo(() => {
    let filtered = allContents
      .filter((c) => c.content_type === activeTab)
      .filter((c) => !selectedContents.some((sel) => sel.id === c.id))
      .filter((c) => {
        const s = searchTerm.toLowerCase();
        if (!searchTerm) return true;
        return (
          (c.prompt && c.prompt.toLowerCase().includes(s)) ||
          (c.model_used && c.model_used.toLowerCase().includes(s)) ||
          (c.content_data && typeof c.content_data === "string" && c.content_data.toLowerCase().includes(s))
        );
      });

    if (filterModel) filtered = filtered.filter((c) => c.model_used === filterModel);
    if (filterStyle) filtered = filtered.filter((c) => c.estilo === filterStyle);
    if (filterRatio) filtered = filtered.filter((c) => c.proporcao === filterRatio);

    if (filterTempMin)
      filtered = filtered.filter((c) => !c.temperatura || c.temperatura >= parseFloat(filterTempMin));
    if (filterTempMax)
      filtered = filtered.filter((c) => !c.temperatura || c.temperatura <= parseFloat(filterTempMax));

    if (filterDurMin)
      filtered = filtered.filter((c) => !c.duracao || c.duracao >= parseInt(filterDurMin));
    if (filterDurMax)
      filtered = filtered.filter((c) => !c.duracao || c.duracao <= parseInt(filterDurMax));

    if (dateFilter) {
      const now = new Date();
      filtered = filtered.filter((c) => {
        const created = new Date(c.created_at);
        if (dateFilter === "7days") return now - created <= 7 * 24 * 60 * 60 * 1000;
        if (dateFilter === "30days") return now - created <= 30 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    if (sortBy === "newest") filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === "oldest") filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === "model") filtered.sort((a, b) => (a.model_used || "").localeCompare(b.model_used || ""));
    if (sortBy === "duration" && activeTab === "video")
      filtered.sort((a, b) => (a.duracao || 0) - (b.duracao || 0));

    return filtered;
  }, [
    allContents,
    activeTab,
    searchTerm,
    filterModel,
    filterStyle,
    filterRatio,
    filterTempMin,
    filterTempMax,
    filterDurMin,
    filterDurMax,
    dateFilter,
    sortBy,
    selectedContents,
  ]);

  function renderPreview(content, modal = false) {
  const baseClasses = "object-contain rounded";

  if (content.content_type === "text") {
    return (
      <div className="text-xs text-gray-700 line-clamp-3">
        {truncate(content.content_data || content.prompt, modal ? 500 : 150)}
      </div>
    );
  }

  if (content.content_type === "image") {
    return (
      <div className={modal ? "flex justify-center" : "w-full max-h-[200px] overflow-hidden rounded"}>
        <img
          src={`${baseUrl}${content.file_path}`}
          alt={content.prompt || "Imagem gerada"}
          className={modal ? `${baseClasses} max-w-full max-h-[400px]` : `${baseClasses} w-full`}
        />
      </div>
    );
  }

  if (content.content_type === "video") {
    return (
      <div
        className={
          modal
            ? "flex items-center justify-center mx-auto w-[400px] h-[300px] bg-gray-50 rounded"
            : "w-full max-h-[200px] overflow-hidden rounded"
        }
      >
        <video
          src={`${baseUrl}${content.file_path}`}
          controls
          className={modal ? `${baseClasses} max-w-full max-h-full` : `${baseClasses} w-full`}
          preload="metadata"
        />
      </div>
    );
  }

  return null;
}

  function handleAddTemp(content) {
    setSelectedContents((prev) => [...prev, content]);
    setSelectedContentModal(null);
  }

  function handleRemoveTemp(content) {
    setSelectedContents((prev) => prev.filter((c) => c.id !== content.id));
  }

  async function handleSaveChanges() {
    if (saving) return;
    setSaving(true);
    try {
      const selectedIds = selectedContents.map((c) => c.id);
      const res = await fetch(projectRoutes.updateContents(projectId), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Erro ao salvar alterações");
      toast.success("Alterações salvas!");
      setOriginalContents([...selectedContents]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <Layout>
        <p className="p-4 text-sm">Carregando conteúdos...</p>
      </Layout>
    );

  if (!project)
    return (
      <Layout>
        <p className="p-4 text-red-500">Projeto não encontrado.</p>
      </Layout>
    );

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

      <section className="flex space-x-6 mt-6">
        {/* Lista de conteúdos */}
        <div className="flex-1 flex flex-col">
          {/* Abas */}
          <div className="flex space-x-4 border-b border-gray-300 mb-4">
            {TAB_TYPES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-sm font-semibold transition ${
                  activeTab === tab ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"
                }`}
              >
                {tab === "text" ? "Textos" : tab === "image" ? "Imagens" : "Vídeos"}
              </button>
            ))}
          </div>

          {/* Busca + filtro/ordenar */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                placeholder="Buscar conteúdos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2 bg-white rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none"
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
                          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50 animate-fadeIn">
                            <h3 className="text-sm font-semibold mb-2">Filtros Avançados</h3>
            
                            {/* Filtro por data */}
                            <label className="block text-xs text-gray-600 mb-1 mt-2">Data</label>
                            <select
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value)}
                              className={`${styles.selectClean} bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md`}
                            >
                              <option value="">Todas</option>
                              <option value="7days">Últimos 7 dias</option>
                              <option value="30days">Últimos 30 dias</option>
                            </select>
            
                            {/* Modelos */}
                            <label className="block text-xs text-gray-600 mb-1 mt-2">Modelo</label>
                            <select
                              value={filterModel}
                              onChange={(e) => setFilterModel(e.target.value)}
                              className={`${styles.selectClean} bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md`}
                            >
                              <option value="">Todos</option>
                              {(activeTab === "text"
                                ? TEXT_MODELS
                                : activeTab === "image"
                                ? IMAGE_MODELS
                                : VIDEO_MODELS
                              ).map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
            
                            {/* Estilos */}
                            {(activeTab === "image" || activeTab === "video") && (
                              <>
                                <label className="block text-xs text-gray-600 mb-1 mt-2">Estilo</label>
                                <select
                                  value={filterStyle}
                                  onChange={(e) => setFilterStyle(e.target.value)}
                                  className={`${styles.selectClean} bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md`}
                                >
                                  <option value="">Todos</option>
                                  {(activeTab === "image" ? IMAGE_STYLES : VIDEO_STYLES).map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
            
                            {/* Proporção (apenas imagens) */}
                            {activeTab === "image" && (
                              <>
                                <label className="block text-xs text-gray-600 mb-1 mt-2">Proporção</label>
                                <select
                                  value={filterRatio}
                                  onChange={(e) => setFilterRatio(e.target.value)}
                                  className={`${styles.selectClean} bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md`}
                                >
                                  <option value="">Todas</option>
                                  {IMAGE_RATIOS.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
            
                            {/* Temperatura (apenas textos) */}
                            {activeTab === "text" && (
                              <div className="flex gap-2 mt-1">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 mb-1 mt-2">Temp Min</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={filterTempMin}
                                    onChange={(e) => setFilterTempMin(e.target.value)}
                                    className="w-full text-sm bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 mb-1 mt-2">Temp Max</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={filterTempMax}
                                    onChange={(e) => setFilterTempMax(e.target.value)}
                                    className="w-full text-sm bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md"
                                  />
                                </div>
                              </div>
                            )}
            
                            {/* Duração (apenas vídeos) */}
                            {activeTab === "video" && (
                              <div className="flex gap-2 mt-1">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 mb-1 mt-2">Duração Mín</label>
                                  <input
                                    type="number"
                                    value={filterDurMin}
                                    onChange={(e) => setFilterDurMin(e.target.value)}
                                    className="w-full text-sm bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 mb-1 mt-2">Duração Máx</label>
                                  <input
                                    type="number"
                                    value={filterDurMax}
                                    onChange={(e) => setFilterDurMax(e.target.value)}
                                    className="w-full text-sm bg-gray-50 rounded px-2 py-1 shadow-sm focus:outline-none focus:shadow-md"
                                  />
                                </div>
                              </div>
                            )}
            
                            {/* Botão limpar filtros */}
                            <button
                              onClick={() => {
                                setFilterModel("");
                                setFilterStyle("");
                                setFilterRatio("");
                                setFilterTempMin("");
                                setFilterTempMax("");
                                setFilterDurMin("");
                                setFilterDurMax("");
                                setDateFilter("");
                              }}
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
                                setSortBy("model");
                                setSortMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Por modelo
                            </button>
                            {activeTab === "video" && (
                              <button
                                onClick={() => {
                                  setSortBy("duration");
                                  setSortMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Por duração
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

          {/* Lista */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredContents.map((content) => (
              <div
                key={content.id}
                className="rounded-lg p-3 bg-white shadow hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedContentModal(content)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {content.content_type === "text" && <FileText className="w-4 h-4 text-blue-500" />}
                  {content.content_type === "image" && <Image className="w-4 h-4 text-green-500" />}
                  {content.content_type === "video" && <Video className="w-4 h-4 text-purple-500" />}
                  <span className="text-xs text-gray-600">
                    {new Date(content.created_at).toLocaleDateString()}
                  </span>
                </div>
                {renderPreview(content)}
                <p className="mt-2 text-xs text-gray-700">
                  Modelo: <span className="font-medium">{content.model_used || "—"}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Painel lateral */}
        <aside className="relative w-72 p-4 bg-white rounded-lg shadow overflow-y-auto pb-20 h-[60vh]">
          <h2 className="font-semibold mb-4">Conteúdos vinculados</h2>
          {selectedContents.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum conteúdo selecionado.</p>
          )}
          <ul className="space-y-3 pb-16">
            {selectedContents.map((content) => (
              <li key={content.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  {content.content_type === "text" && <FileText />}
                  {content.content_type === "image" && (
                    <img src={`${baseUrl}${content.file_path}`} className="w-10 h-10 object-cover rounded" />
                  )}
                  {content.content_type === "video" && (
                    <video
                        src={`${baseUrl}${content.file_path}`}
                        className="w-10 h-10 object-cover rounded"
                      />
                  )}
                  <span className="text-xs max-w-[120px] truncate">
                    {truncate(content.prompt || content.content_data, 40)}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveTemp(content)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {selectedContents.length > 0 && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition ${
                  saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
      </section>

      {/* Modal de visualização */}
      {selectedContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
          <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setSelectedContentModal(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {selectedContentModal.content_type === "text" && "Visualização do Texto"}
              {selectedContentModal.content_type === "image" && "Visualização da Imagem"}
              {selectedContentModal.content_type === "video" && "Visualização do Vídeo"}
            </h2>

            {/* Preview grande */}
            <div className="mb-4">{renderPreview(selectedContentModal, true)}</div>

            {/* Detalhes do conteúdo */}
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Modelo:</strong> {selectedContentModal.model_used || "—"}</p>
              {selectedContentModal.estilo && (
                <p><strong>Estilo:</strong> {selectedContentModal.estilo}</p>
              )}
              {selectedContentModal.proporcao && (
                <p><strong>Proporção:</strong> {selectedContentModal.proporcao}</p>
              )}
              {selectedContentModal.duracao && (
                <p><strong>Duração:</strong> {selectedContentModal.duracao}s</p>
              )}
              <p><strong>Criado em:</strong> {new Date(selectedContentModal.created_at).toLocaleString()}</p>
            </div>

            {/* Botão de adicionar à seleção */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => handleAddTemp(selectedContentModal)}
                className="bg-black text-white px-4 py-2 rounded text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition"
              >
                Adicionar ao projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
