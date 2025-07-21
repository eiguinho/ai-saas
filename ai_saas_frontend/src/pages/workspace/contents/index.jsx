import { useEffect, useState, useMemo, useRef } from "react";
import Layout from "../../../components/layout/Layout";
import styles from "./contents.module.css";
import { toast } from "react-toastify";
import { generatedContentRoutes } from "../../../services/apiRoutes";
import {
  FileText,
  Image,
  Video,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

const TAB_TYPES = ["text", "image", "video"];

export default function GeneratedContentsList() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [allContents, setAllContents] = useState([]);
  const [activeTab, setActiveTab] = useState("text");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedContent, setSelectedContent] = useState(null);

  // Dropdowns
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // 🔹 Filtros globais
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

  // Fechar menus ao clicar fora
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(generatedContentRoutes.list, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao buscar conteúdos");
        const contents = await res.json();
        setAllContents(contents);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Função para deletar conteúdo
  async function handleDeleteContent(id) {
    if (!window.confirm("Tem certeza que quer deletar este conteúdo?")) return;
    try {
      const res = await fetch(`${generatedContentRoutes.list}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao deletar conteúdo");
      setAllContents((prev) => prev.filter((c) => c.id !== id));
      toast.success("Conteúdo deletado com sucesso!");
      if (selectedContent?.id === id) setSelectedContent(null);
    } catch (err) {
      toast.error(err.message);
    }
  }

  const filteredContents = useMemo(() => {
    let filtered = allContents
      .filter((c) => c.content_type === activeTab)
      .filter((c) => {
        const s = searchTerm.toLowerCase();
        if (!searchTerm) return true;
        return (
          (c.prompt && c.prompt.toLowerCase().includes(s)) ||
          (c.model_used && c.model_used.toLowerCase().includes(s)) ||
          (c.content_data &&
            typeof c.content_data === "string" &&
            c.content_data.toLowerCase().includes(s))
        );
      });

    // 🔹 Filtrar por modelo/estilo/proporção
    if (filterModel) filtered = filtered.filter((c) => c.model_used === filterModel);
    if (filterStyle) filtered = filtered.filter((c) => c.estilo === filterStyle);
    if (filterRatio) filtered = filtered.filter((c) => c.proporcao === filterRatio);

    // 🔹 Filtro de temperatura (textos)
    if (filterTempMin)
      filtered = filtered.filter((c) => !c.temperatura || c.temperatura >= parseFloat(filterTempMin));
    if (filterTempMax)
      filtered = filtered.filter((c) => !c.temperatura || c.temperatura <= parseFloat(filterTempMax));

    // 🔹 Filtro de duração (vídeos)
    if (filterDurMin)
      filtered = filtered.filter((c) => !c.duracao || c.duracao >= parseInt(filterDurMin));
    if (filterDurMax)
      filtered = filtered.filter((c) => !c.duracao || c.duracao <= parseInt(filterDurMax));

    // 🔹 Filtro por data
    if (dateFilter) {
      const now = new Date();
      filtered = filtered.filter((c) => {
        const created = new Date(c.created_at);
        if (dateFilter === "7days") {
          return now - created <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "30days") {
          return now - created <= 30 * 24 * 60 * 60 * 1000;
        } else return true;
      });
    }

    // 🔹 Ordenação
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "model") {
      filtered.sort((a, b) => (a.model_used || "").localeCompare(b.model_used || ""));
    } else if (sortBy === "duration" && activeTab === "video") {
      filtered.sort((a, b) => (a.duracao || 0) - (b.duracao || 0));
    }

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
  ]);

  function truncate(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  function renderPreview(content, isModal = false) {
  const baseClasses = "object-contain rounded";

  if (content.content_type === "text") {
    return (
      <div className="text-xs text-gray-700 line-clamp-3">
        {truncate(content.content_data || content.prompt, isModal ? 500 : 150)}
      </div>
    );
  }

  if (content.content_type === "image") {
    return (
      <div className={isModal ? "flex justify-center" : "w-full max-h-[200px] overflow-hidden rounded"}>
        <img
          src={`${baseUrl}${content.file_path}`}
          alt={content.prompt || "Imagem gerada"}
          className={isModal ? `${baseClasses} max-w-full max-h-[400px]` : `${baseClasses} w-full`}
        />
      </div>
    );
  }

  if (content.content_type === "video") {
    return (
      <div
        className={
          isModal
            ? "flex items-center justify-center mx-auto w-[400px] h-[300px] bg-gray-50 rounded"
            : "w-full max-h-[200px] overflow-hidden rounded"
        }
      >
        <video
          src={`${baseUrl}${content.file_path}`}
          controls
          className={isModal ? `${baseClasses} max-w-full max-h-full` : `${baseClasses} w-full`}
          preload="metadata"
        />
      </div>
    );
  }

  return null;
}

  // Modelos, estilos e proporções
  const TEXT_MODELS = ["GPT-4", "GPT-3.5 Turbo", "Google Gemini", "Cloud"];
  const IMAGE_MODELS = ["DALL-E 3", "Midjourney", "Stable Diffusion", "Adobe Firefly"];
  const VIDEO_MODELS = ["OpenAI Sora", "Runway ML", "Synthesia", "Pika Labs"];

  const IMAGE_STYLES = ["Fotorrealista", "Artístico", "Cartoon", "Abstrato", "Arte Digital"];
  const IMAGE_RATIOS = ["Quadrado (1:1)", "Paisagem (16:9)", "Retrato (9:16)", "Clássico (4:3)", "Retrato (3:4)"];
  const VIDEO_STYLES = ["Realista", "Animado", "Cinematográfico", "Documentário", "Artístico"];

  return (
    <Layout>
      <h1 className={styles.title}>Meus Conteúdos Gerados</h1>
      <p className="text-gray-600 mb-6">Aqui estão todos os conteúdos que você gerou com IA</p>

      {/* Abas */}
      <div className="flex space-x-4 border-b border-gray-300 mb-4">
        {TAB_TYPES.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-semibold transition ${
              activeTab === tab
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab === "text" ? "Textos" : tab === "image" ? "Imagens" : "Vídeos"}
          </button>
        ))}
      </div>

      {/* Barra de busca + ícones de filtro/ordenar */}
      <div className="flex items-center justify-between mb-4">
        {/* Busca */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Buscar conteúdos..."
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

      {/* Lista de conteúdos */}
      {loading ? (
        <p className="mt-6 text-sm">Carregando conteúdos...</p>
      ) : filteredContents.length === 0 ? (
        <p className="mt-6 text-gray-500 text-sm">Nenhum conteúdo encontrado para esta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredContents.map((content) => (
            <div
              key={content.id}
              className="flex flex-col rounded-lg p-4 bg-white shadow hover:shadow-md transition cursor-pointer relative"
              onClick={() => setSelectedContent(content)}
            >
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContent(content.id);
                }}
                aria-label="Deletar conteúdo"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                {content.content_type === "text" && <FileText className="w-4 h-4 text-blue-500" />}
                {content.content_type === "image" && <Image className="w-4 h-4 text-green-500" />}
                {content.content_type === "video" && <Video className="w-4 h-4 text-purple-500" />}
                <span className="text-xs text-gray-600">{new Date(content.created_at).toLocaleDateString()}</span>
              </div>

              {/* Conteúdo cresce e ocupa espaço */}
              <div className="flex-grow">{renderPreview(content)}</div>

              {/* Rodapé fixo no fim */}
              <p className="mt-auto text-xs text-gray-700 pt-2">
                Modelo: <span className="font-medium">{content.model_used}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes do conteúdo */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
          <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setSelectedContent(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Detalhes do Conteúdo</h2>
            <div className="mb-4">{renderPreview(selectedContent, true)}</div>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Prompt:</strong> {selectedContent.prompt || "—"}
              </p>
              <p>
                <strong>Modelo:</strong> {selectedContent.model_used || "—"}
              </p>
              {selectedContent.content_type === "text" && (
                <p>
                  <strong>Temperatura:</strong> {selectedContent.temperatura ?? "—"}
                </p>
              )}
              {selectedContent.content_type === "video" && (
                <p>
                  <strong>Duração:</strong> {selectedContent.duracao ? `${selectedContent.duracao}s` : "—"}
                </p>
              )}
              <p>
                <strong>Data:</strong> {new Date(selectedContent.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}