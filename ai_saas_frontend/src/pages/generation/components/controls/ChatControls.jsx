import React from "react";
import Select from "react-select";
import { TEXT_MODELS } from "../../../../utils/constants";

export default function ChatControls({ model, setModel, temperature, setTemperature, maxTokens, setMaxTokens, isTemperatureLocked }) {
  return (
    <div className="flex items-center gap-4 text-sm justify-between mt-3">
      <div className="flex-1">
        <Select
          value={TEXT_MODELS.find((m) => m.value === model)}
          onChange={(selected) => setModel(selected.value)}
          options={TEXT_MODELS}
          isSearchable={false}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "var(--color-primary)",
              border: "none",
              borderRadius: 12,
              padding: "2px 4px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }),
            singleValue: (base) => ({ ...base, color: "#fff", fontWeight: "500" }),
            dropdownIndicator: (base) => ({ ...base, color: "#fff" }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden" }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "rgba(59, 130, 246,0.2)" : "#fff",
              color: state.isFocused ? "#3b82f6" : "#000",
              cursor: "pointer",
            }),
          }}
        />
      </div>

      {!isTemperatureLocked && (
        <div className="flex-1 flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Temp: {temperature}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full bg-gray-200 accent-[var(--color-primary)] cursor-pointer"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <label className="text-gray-700 font-medium mb-1">Max Tokens: {maxTokens}</label>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          className="w-full h-2 rounded-full bg-gray-200 accent-[var(--color-primary)] cursor-pointer"
        />
      </div>
    </div>
  );
}
