import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import { userRoutes, adminRoutes, plansRoutes } from "../../../services/apiRoutes";
import { apiFetch } from "../../../services/apiService";

export default function UserDetailsModal({ user, onClose, onUpdate }) {
  const [fullName, setFullName] = useState(user.full_name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [isActive, setIsActive] = useState(user.is_active);
  const [plan, setPlan] = useState(user.plan?.id || "");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await apiFetch(plansRoutes.list);
        setPlans(data);
      } catch {
        toast.error("Erro ao carregar planos.");
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    setFullName(user.full_name);
    setUsername(user.username);
    setEmail(user.email);
    setIsActive(user.is_active);
    setPlan(user.plan?.id || "");
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Atualiza dados do usuário
      await apiFetch(userRoutes.updateUser(user.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, username, email }),
      });

      // Atualiza status
      await apiFetch(adminRoutes.updateUserStatus(user.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });

      // Atualiza plano
      if (plan) {
        await apiFetch(adminRoutes.updateUserPlan(user.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: plan }),
        });
      }

      toast.success("Usuário atualizado.");

      const updatedUser = {
        ...user,
        full_name: fullName,
        username,
        email,
        is_active: isActive,
        plan: plans.find((p) => p.id === plan) || user.plan?.id,
      };
      onUpdate(updatedUser);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  };

  const planOptions = plans.map((p) => ({ value: p.id, label: p.name }));
  const activeOptions = [
    { value: true, label: "Sim" },
    { value: false, label: "Não" },
  ];

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: 12,
      padding: "2px 4px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      border: "1px solid #d1d5db",
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "#111827", fontWeight: "400" }),
    menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgba(59, 130, 246,0.2)" : "#fff",
      color: state.isFocused ? "#3b82f6" : "#111827",
      cursor: "pointer",
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-lg font-semibold mb-5">Editar Usuário</h2>

        <div className="flex flex-col gap-4">
          {/* Campos */}
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Plano</label>
            <Select value={planOptions.find((p) => p.value === plan)} onChange={(selected) => setPlan(selected?.value || "")} options={planOptions} isSearchable={false} styles={selectStyles} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ativo?</label>
            <Select value={activeOptions.find((a) => a.value === isActive)} onChange={(selected) => setIsActive(selected.value)} options={activeOptions} isSearchable={false} styles={selectStyles} />
          </div>

          <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
