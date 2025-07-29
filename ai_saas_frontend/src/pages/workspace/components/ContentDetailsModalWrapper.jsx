import ContentDetailsModal from "./ContentDetailsModal";

export default function ContentDetailsModalWrapper({ content, onClose, onAdd, baseUrl }) {
  if (!content) return null;

  return (
    <ContentDetailsModal
      content={content}
      onClose={onClose}
      onAdd={() => onAdd(content)}
      showAddButton={true}
      baseUrl={baseUrl}
    />
  );
}