import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Layout from "../../../components/layout/Layout";
import styles from "../profile.module.css";
import { useAuth } from "../../../context/AuthContext";
import { emailRoutes, userRoutes, notificationRoutes } from "../../../services/apiRoutes";
import { useNotifications } from "../../../context/NotificationContext";
import SecurityModal from "../../../components/modals/SecurityModal";

export default function EditEmail() {
  const { user, loginSuccess } = useAuth();
  const navigate = useNavigate();
  const { fetchNotifications } = useNotifications();
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleRequestCode = async () => {
    setLoadingCode(true);
    setError("");
    if (email === user.email) {
      setError("O novo email não pode ser igual ao atual.");
      setLoadingCode(false);
      return;
    }
    try {
      const res = await fetch(emailRoutes.requestEmailCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        data = { error: "Resposta inválida do servidor" };
      }
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      toast.success("Código enviado para o novo email.");
      setModalVisible(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleVerifyCode = async (code) => {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(emailRoutes.verifyEmailCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        data = { error: "Resposta inválida do servidor" };
      }
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      toast.success("Email verificado com sucesso!");
      setEmailVerified(true);
      setModalVisible(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(userRoutes.updateUser(user.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const rawText = await res.text();
      const data = JSON.parse(rawText);
      if (!res.ok) throw new Error(data.error);
      toast.success("Email atualizado com sucesso!");
      await fetch(notificationRoutes.create, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Seu email foi alterado!`,
          link: "/profile",
        }),
      });
      fetchNotifications();
      const updatedUser = await fetch(userRoutes.getCurrentUser(), {
        credentials: "include",
      }).then((res) => res.json());
      loginSuccess({ user: updatedUser });
      navigate("/profile/security");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className={styles.returnLink}>
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-700 hover:text-black">
          <ArrowLeft className="w-4 h-4 mr-2" />
        </button>
        <nav className="flex items-center text-sm space-x-1">
          <Link to="/profile" className="text-gray-700 hover:text-black">Perfil</Link>
          <span>/</span>
          <Link to="/profile/security" className="text-gray-700 hover:text-black">Security</Link>
          <span>/</span>
          <span className="text-gray-500">Editar Email</span>
        </nav>
      </div>
      <section className="flex flex-col items-center justify-center space-y-6">
        <h1 className={styles.title}>Alterar Email</h1>
        <div className={styles.statCard}>
          <p className={styles.statSubtext}>Informe um novo email. Será enviado um código de verificação.</p>
          <div className="relative mt-4 mb-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              placeholder="Novo email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-2 rounded-lg border border-gray-300 text-black text-sm shadow-sm focus:outline-none focus:shadow-md"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          <div className="flex justify-between mt-4">
            <button
              onClick={handleRequestCode}
              disabled={!email || loadingCode}
              className="bg-black text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition"
            >
              {loadingCode ? "Enviando..." : "Verificar"}
            </button>
            {emailVerified && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition"
              >
                {saving ? "Salvando..." : "Salvar Email"}
              </button>
            )}
          </div>
        </div>
      </section>
      <SecurityModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        onVerify={handleVerifyCode}
        onRequestCode={handleRequestCode}
        loading={verifying}
        errorMessage={error}
      />
    </Layout>
  );
}