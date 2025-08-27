import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { User, LockKeyhole, Mail, UserCircle, ArrowLeft, Layers } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import { adminRoutes, plansRoutes } from "../../../services/apiRoutes";
import styles from "../admin.module.css";

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    plan_id: "",
  });
  const [plans, setPlans] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(plansRoutes.list);
        if (!res.ok) throw new Error("Erro ao carregar planos");
        const data = await res.json();
        setPlans(data || []);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (form.email && !emailRegex.test(form.email)) setEmailError("E-mail inválido");
    else setEmailError("");

    if (form.password && !passwordRegex.test(form.password))
      setPasswordError(
        "Senha deve ter 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial"
      );
    else setPasswordError("");
  }, [form.email, form.password]);

  const isFormValid =
    form.full_name &&
    form.username &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.plan_id &&
    !emailError &&
    !passwordError &&
    form.password === form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", "user");
      formData.append("plan_id", form.plan_id);

      const res = await fetch(adminRoutes.createUser(), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar usuário");

      toast.success("Usuário criado com sucesso!");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.returnLink}>
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center text-gray-700 hover:text-black"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </button>
                    <nav className="flex items-center text-sm space-x-1">
                      <Link to="/admin" className="text-gray-700 hover:text-black">
                        Painel Administrativo
                      </Link>
                      <span>/</span>
                      <span className="text-gray-500">Gerenciar Usuários</span>
                    </nav>
                  </div>

      <section className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-6">Criar Usuário</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="full_name"
              placeholder="Nome completo"
              value={form.full_name}
              onChange={handleChange}
              className="w-full pl-10 py-2 rounded-lg border border-gray-300 text-black text-sm shadow-sm focus:outline-none focus:shadow-md"
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full pl-10 py-2 rounded-lg border border-gray-300 text-black text-sm shadow-sm focus:outline-none focus:shadow-md"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 py-2 rounded-lg border text-black text-sm shadow-sm focus:outline-none focus:shadow-md border-gray-300"
              required
            />
            {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
          </div>

          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              className={`w-full pl-10 py-2 rounded-lg border text-black text-sm shadow-sm focus:outline-none focus:shadow-md ${
                passwordError ? "border-red-400" : "border-gray-300"
              }`}
              required
            />
            {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
          </div>

          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar senha"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
              required
            />
            {form.password &&
              form.confirmPassword &&
              form.password !== form.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">As senhas não coincidem</p>
              )}
          </div>

          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Select
              value={plans.find((p) => p.id === form.plan_id) || null}
              onChange={(selected) => setForm((prev) => ({ ...prev, plan_id: selected?.id || "" }))}
              options={plans}
              getOptionLabel={(p) => p.name}
              getOptionValue={(p) => p.id}
              placeholder="Selecione um plano"
              className="pl-10 text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: 12,
                  borderColor: "#d1d5db",
                  paddingLeft: 2,
                  minHeight: "38px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "rgba(59, 130, 246,0.1)" : "#fff",
                  color: "#000",
                  cursor: "pointer",
                }),
              }}
              menuPortalTarget={document.body}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Cadastrando..." : "Cadastrar Usuário"}
          </button>
        </form>
      </section>
    </Layout>
  );
}
