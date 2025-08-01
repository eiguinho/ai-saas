import React, { useRef, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";

export default function SortMenu({ activeTab, sortBy, setSortBy }) {
  const sortRef = useRef(null);
  const [sortMenuOpen, setSortMenuOpen] = React.useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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

          {/* Só mostra esses dois abaixo para tabs que não sejam "project" */}
          {activeTab !== "project" && (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}