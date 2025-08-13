import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import styles from "./projects.module.css";
import { toast } from "react-toastify";
import { projectRoutes } from "../../../services/apiRoutes";
import { ArrowLeft, Search } from "lucide-react";
import ContentCard from "../components/ContentCard";
import SortMenu from "../components/SortMenu";
import FiltersPanel from "../components/FiltersPanel";
import useContentsFetch from "../hooks/useContentsFetch";
import useFilters from "../hooks/useFilters";
import { TAB_TYPES } from "../../../utils/constants";
import SelectedContentsSidebar from "../../workspace/components/SelectedContentsSidebar";
import ContentDetailsModalWrapper from "../../workspace/components/ContentDetailsModalWrapper";
import useSelectionMode from "../hooks/useSelectionMode";
import SelectionToggleButton from "../components/SelectionToggleButton";
import SelectionToolbar from "../components/SelectionToolbar";

export default function ModifyContent() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { loading: loadingContents, allContents } = useContentsFetch();
  const {
    filteredContents,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterProps,
    sortProps
  } = useFilters(allContents);

  const [loadingProject, setLoadingProject] = useState(true);
  const [project, setProject] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [originalContents, setOriginalContents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedContentModal, setSelectedContentModal] = useState(null);

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const {
    selectionMode,
    selectedItems,
    toggleSelectionMode,
    toggleSelect,
    clearSelection
  } = useSelectionMode();

  function handleConfirmSelection() {
    const onlyNew = selectedItems.filter(
      (item) => !selectedContents.some((sc) => sc.id === item.id)
    );
    setSelectedContents((prev) => [...prev, ...onlyNew]);
    clearSelection();
    toast.success(`${onlyNew.length} conteúdo(s) adicionado(s) à seleção`);
  }

  useEffect(() => {
    async function loadProject() {
      setLoadingProject(true);
      try {
        const resProject = await fetch(projectRoutes.get(projectId), {
          credentials: "include"
        });
        if (!resProject.ok) throw new Error("Erro ao buscar projeto");

        const projectData = await resProject.json();
        const projectContentIds = projectData.contents.map((c) =>
          typeof c === "string" ? c : c.id
        );
        const projectContents = allContents.filter((c) =>
          projectContentIds.includes(c.id)
        );

        setProject(projectData);
        setSelectedContents(projectContents);
        setOriginalContents(projectContents);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoadingProject(false);
      }
    }

    if (projectId && allContents.length > 0) loadProject();
  }, [projectId, allContents]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterMenuOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAddTemp(content) {
    if (!selectedContents.some((c) => c.id === content.id)) {
      setSelectedContents((prev) => [...prev, content]);
    }
    setSelectedContentModal(null);
  }

  function handleRemoveTemp(contentId) {
    setSelectedContents((prev) => prev.filter((c) => c.id !== contentId));
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
        body: JSON.stringify({ content_ids: selectedIds })
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

  if (loadingContents || loadingProject) {
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
      <div className="flex items-center justify-between">
        <div className={styles.returnLink}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-black"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <nav className="flex items-center text-sm space-x-1 ml-4">
            <Link to="/workspace/projects" className="text-gray-700 hover:text-black">
              Projetos
            </Link>
            <span>/</span>
            <span className="text-gray-500">{project.name}</span>
            <span>/</span>
            <span className="text-gray-500">Modificar Conteúdo</span>
          </nav>
        </div>
      </div>

      <section className="flex space-x-6 mt-6">
        <div className="flex-1 flex flex-col">
          <div className="flex space-x-6 border-b border-gray-300 mb-4 text-sm font-semibold">
            {TAB_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`pb-2 ${
                  activeTab === value
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

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

            <div className="flex gap-3 items-center">
              <SelectionToggleButton
                selectionMode={selectionMode}
                onToggle={toggleSelectionMode}
              />
              <div ref={filterRef}>
                <FiltersPanel
                  open={filterMenuOpen}
                  onToggle={() => setFilterMenuOpen(!filterMenuOpen)}
                  activeTab={activeTab}
                  {...filterProps}
                />
              </div>
              <div ref={sortRef}>
                <SortMenu
                  open={sortMenuOpen}
                  onToggle={() => setSortMenuOpen(!sortMenuOpen)}
                  activeTab={activeTab}
                  {...sortProps}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredContents.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum conteúdo encontrado.</p>
            ) : (
              filteredContents
                .filter((c) => !selectedContents.some((sel) => sel.id === c.id))
                .map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onSelect={(c) => setSelectedContentModal(c)}
                    selectionMode={selectionMode}
                    selected={selectedItems.some((sel) => sel.id === content.id)}
                    onToggleSelect={toggleSelect}
                    showDelete={false}
                  />
                ))
            )}
          </div>
        </div>

        <SelectedContentsSidebar
          selectedContents={selectedContents}
          onRemove={handleRemoveTemp}
          baseUrl={baseUrl}
        />

        {selectedContents.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}
      </section>

      <SelectionToolbar
        count={selectedItems.length}
        confirmLabel="Adicionar à seleção"
        onConfirm={handleConfirmSelection}
        confirmColor="blue"
      />

      <ContentDetailsModalWrapper
        content={selectedContentModal}
        onClose={() => setSelectedContentModal(null)}
        onAdd={handleAddTemp}
        baseUrl={baseUrl}
      />
    </Layout>
  );
}
