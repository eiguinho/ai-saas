import { useState } from "react";

/**
 * Hook para gerenciar seleção múltipla de itens
 * Retorna estado e funções para alternar modo de seleção e marcar/desmarcar itens.
 */
export default function useSelectionMode() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  /** Ativa ou desativa o modo de seleção */
  function toggleSelectionMode() {
    setSelectionMode((prev) => {
      const newMode = !prev;
      if (!newMode) setSelectedItems([]); // limpamos ao desativar
      return newMode;
    });
  }

  /** Marca ou desmarca um item */
  function toggleSelect(item) {
    setSelectedItems((prev) =>
      prev.some((c) => c.id === item.id)
        ? prev.filter((c) => c.id !== item.id)
        : [...prev, item]
    );
  }

  /** Limpa a seleção */
  function clearSelection() {
    setSelectedItems([]);
    setSelectionMode(false);
  }

  return {
    selectionMode,
    selectedItems,
    toggleSelectionMode,
    toggleSelect,
    clearSelection,
  };
}
