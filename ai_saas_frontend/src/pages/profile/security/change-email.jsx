import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Layout from "../../../components/layout/Layout";
import styles from "../profile.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { emailRoutes, userRoutes } from "../../../services/apiRoutes";

export default function EditEmail() {
  const { user, loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(120);

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Código enviado para o novo email.");
      setModalVisible(true);
      startCooldown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(emailRoutes.verifyEmailCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Email verificado com sucesso!");
      setEmailVerified(true);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Email atualizado com sucesso!");

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

  const startCooldown = () => {
    setCanResend(false);
    setResendCooldown(120);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <Layout>
      <div className={styles.returnLink}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          <nav className="flex items-center text-sm space-x-1">
            <Link to="/profile" className="text-gray-700 hover:text-black">
              Perfil
            </Link>
            <span>/</span>
            <Link to="/profile/security" className="text-gray-700 hover:text-black">
              Security
            </Link>
            <span>/</span>
            <span className="text-gray-500">Editar Email</span>
          </nav>
        </div>
      <section className="flex flex-col items-center justify-center space-y-6">
        <h1 className={styles.title}>Alterar Email</h1>

        <div className={styles.statCard}>
          <p className={styles.statSubtext}>
            Informe um novo email. Será enviado um código de verificação.
          </p>

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

          <div className="flex justify-end mt-4">
            <button
              onClick={handleRequestCode}
              disabled={!email || loadingCode}
              className="bg-black text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition"
            >
              {loadingCode ? "Enviando..." : "Verificar"}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DE VERIFICAÇÃO */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
          <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setModalVisible(false)}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className={styles.subTitle}>Verificar Novo Email</h2>
            <p className="text-sm text-gray-600 mb-2">
              Digite o código enviado para: <b>{email}</b>
            </p>

            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Código de verificação"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={emailVerified}
                className="w-full pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md disabled:opacity-60"
              />
            </div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="flex justify-between">
              {!emailVerified && (
                <button
                  onClick={handleVerifyCode}
                  disabled={verifying || emailVerified}
                  className="bg-black text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {verifying ? "Verificando..." : "Verificar Código"}
                </button>
              )}

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

            <button
              onClick={handleRequestCode}
              disabled={!canResend}
              className="w-full mt-6 text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {canResend ? "Reenviar código" : `Reenviar em ${resendCooldown}s`}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
