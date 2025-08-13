import { Trash } from "lucide-react";
import { useState } from "react";
import { formatDateTime } from "../../../utils/dateUtils";
import { notificationRoutes } from "../../../services/apiRoutes";
import { toast } from "react-toastify";

export default function NotificationItem({ notification, selected, setSelected }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isSelected = selected.includes(notification.id);

  const toggleSelect = () => {
    if (isSelected) {
      setSelected((prev) => prev.filter((id) => id !== notification.id));
    } else {
      setSelected((prev) => [...prev, notification.id]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Deseja excluir esta notificação?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(notificationRoutes.delete(notification.id), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao excluir notificação");
      toast.success("Notificação excluída.");
      setSelected((prev) => prev.filter((id) => id !== notification.id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-start justify-between bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={toggleSelect}
          className="mt-1"
        />
        <div>
          <p className="font-medium text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDateTime(notification.created_at)}</p>
        </div>
      </div>

      <button
        onClick={handleDelete}
        className="text-gray-500 hover:text-red-600 transition"
        disabled={isDeleting}
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  );
}
