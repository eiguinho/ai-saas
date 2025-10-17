import Select from "react-select";

const baseSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: 12,
    padding: "2px 4px",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "0 2px 6px rgba(0,0,0,0.15)",
    border: state.isFocused ? "1px solid #3b82f6" : "1px solid #d1d5db",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontWeight: "400",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(59, 130, 246, 0.15)" : "#fff",
    color: state.isFocused ? "#3b82f6" : "#111827",
    cursor: "pointer",
    padding: "8px 12px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Selecione...",
  isSearchable = false,
  getOptionLabel,
  getOptionValue,
  className = "",
  menuPortalTarget = document.body,
  styles = {},
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isSearchable={isSearchable}
      styles={{ ...baseSelectStyles, ...styles }}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      className={className}
      menuPortalTarget={menuPortalTarget}
    />
  );
}