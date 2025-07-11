import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import styles from "../profile.module.css";

export default function EditUsername() {
  const { user, loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "" });
  const [loading, setLoading] = useState(false);

  // Preencher username atual ao carregar
  useEffect(() => {
    if (user?.username) {
      setForm({ username: user.username });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: form.username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar nome de usuário.");

      toast.success("Nome de usuário atualizado com sucesso!");

      const updatedUser = await fetch("/api/users/me", {
        credentials: "include",
      }).then((res) => res.json());

      loginSuccess({ user: updatedUser });

      navigate("/profile/security");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="flex flex-col items-center justify-center space-y-6">
        <h1 className={`${styles.title} text-center`}>Atualizar Nome de Usuário</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className={styles.statCard}>
            <p className={`${styles.statSubtext} mb-4`}>
              Você pode modificar o nome de usuário (username) associado à sua conta.
            </p>

            <p className={`${styles.blockTitle} text-sm mb-2`}>Novo nome de usuário</p>
            <div className="relative mb-4">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="username"
                placeholder="Nome de usuário"
                value={form.username}
                onChange={handleChange}
                className="w-full pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-black text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition"
                disabled={!form.username || loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </Layout>
  );
}