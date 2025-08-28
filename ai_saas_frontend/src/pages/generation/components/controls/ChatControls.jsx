import React from "react";
import Select, { components } from "react-select";
import { TEXT_MODELS } from "../../../../utils/constants";
import { useAuth } from "../../../../context/AuthContext";

// Componente de Option customizado para tooltip
const Option = (props) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between">
        <span>{data.label}</span>
        {!data.isAllowed && (
          <span
            className="ml-2 text-xs text-red-500"
            title={data.tooltip || "Melhore seu plano para utilizar esse recurso!"}
          >
            ⚠
          </span>
        )}
      </div>
    </components.Option>
  );
};

export default function ChatControls({
  model,
  setModel,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  isTemperatureLocked,
}) {
  const { user } = useAuth();

  // transforma a lista de features do plano em um objeto key → boolean
  const featuresMap = (user?.plan?.features || []).reduce((acc, pf) => {
  acc[pf.key] = pf.value === "true";
  return acc;
}, {});

  // permissões
  const canUseGpt5 = !!featuresMap["generate_text"];
  const canAttachFiles = !!featuresMap["attach_files"];

  // adiciona atributos de permissão nos modelos
  const allowedModels = TEXT_MODELS.map((m) => {
    if (m.isGpt5) {
      return {
        ...m,
        isAllowed: canUseGpt5,
        tooltip: canUseGpt5
          ? ""
          : "Seu plano atual não permite usar este modelo",
      };
    }
    return { ...m, isAllowed: true };
  });

  return (
    <div className="flex items-center gap-4 text-sm justify-between mt-3">
      <div className="flex-1">
        <Select
          value={allowedModels.find((m) => m.value === model)}
          onChange={(selected) => setModel(selected.value)}
          options={allowedModels}
          isSearchable={false}
          isOptionDisabled={(option) => !option.isAllowed}
          components={{ Option }}
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
              opacity: state.data.isAllowed ? 1 : 0.5,
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
