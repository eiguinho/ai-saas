import { useState, useMemo } from "react";
import {
  TEXT_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  IMAGE_STYLES,
  VIDEO_STYLES,
  IMAGE_RATIOS,
} from "../../../utils/constants";

export default function useFilters(allContents) {
  const [activeTab, setActiveTab] = useState("text");
  const [searchTerm, setSearchTerm] = useState("");

  // filtros globais
  const [filterModel, setFilterModel] = useState("");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterRatio, setFilterRatio] = useState("");
  const [filterTempMin, setFilterTempMin] = useState("");
  const [filterTempMax, setFilterTempMax] = useState("");
  const [filterDurMin, setFilterDurMin] = useState("");
  const [filterDurMax, setFilterDurMax] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

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

    // filtros avançados
    if (filterModel) filtered = filtered.filter((c) => c.model_used === filterModel);
    if (filterStyle) filtered = filtered.filter((c) => c.style === filterStyle);
    if (filterRatio) filtered = filtered.filter((c) => c.ratio === filterRatio);

    if (filterTempMin)
      filtered = filtered.filter(
        (c) => !c.temperature || c.temperature >= parseFloat(filterTempMin)
      );
    if (filterTempMax)
      filtered = filtered.filter(
        (c) => !c.temperature || c.temperature <= parseFloat(filterTempMax)
      );

    if (filterDurMin)
      filtered = filtered.filter(
        (c) => !c.duration || c.duration >= parseInt(filterDurMin)
      );
    if (filterDurMax)
      filtered = filtered.filter(
        (c) => !c.duration || c.duration <= parseInt(filterDurMax)
      );

    if (dateFilter) {
      const now = new Date();
      filtered = filtered.filter((c) => {
        const created = new Date(c.created_at);
        if (dateFilter === "7days") {
          return now - created <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "30days") {
          return now - created <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // ordenação
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "model") {
      filtered.sort((a, b) =>
        (a.model_used || "").localeCompare(b.model_used || "")
      );
    } else if (sortBy === "duration" && activeTab === "video") {
      filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
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

  const filterProps = {
    filterModel,
    setFilterModel,
    filterStyle,
    setFilterStyle,
    filterRatio,
    setFilterRatio,
    filterTempMin,
    setFilterTempMin,
    filterTempMax,
    setFilterTempMax,
    filterDurMin,
    setFilterDurMin,
    filterDurMax,
    setFilterDurMax,
    dateFilter,
    setDateFilter,
    activeTab,
  };

  const sortProps = {
    sortBy,
    setSortBy,
  };

  return {
    filteredContents,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterProps,
    sortProps,
  };
}
