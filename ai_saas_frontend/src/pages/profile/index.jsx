import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, HelpCircle, CreditCard, X, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./profile.module.css";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { emailRoutes} from "../../services/apiRoutes";

export default function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { securityVerified, setSecurityVerified } = useAuth();

  // Função para iniciar o cooldown
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

  // Inicia cooldown ao abrir modal
  useEffect(() => {
    if (!showModal) return;
    startCooldown();
  }, [showModal]);

  const requestCode = async () => {
    startCooldown();
    try {
      const res = await fetch(emailRoutes.sendSecurityCode, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao enviar código.");
      toast.success("Código enviado para seu e-mail.");
    } catch (err) {
      setError("Erro ao enviar o código. Tente novamente.");
    }
  };

  const handleSecurityClick = async () => {
    if (securityVerified) {
        navigate("/profile/security");
        return;
    }
    setError("");
    setSecurityCode("");
    setShowModal(true);
    try {
      const res = await fetch(emailRoutes.sendSecurityCode, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao enviar código.");
      toast.success("Código enviado para seu e-mail.");
    } catch (err) {
      setError("Erro ao enviar o código. Tente novamente.");
    }
  };

  const verifyCode = async () => {
    try {
      const res = await fetch(emailRoutes.verifySecurityCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: securityCode }),
      });

      if (!res.ok) throw new Error("Código inválido.");
      toast.success("Código verificado com sucesso!");
      setShowModal(false);
      setSecurityVerified(true);
      navigate("/profile/security");
    } catch (err) {
      setError("Código incorreto ou expirado.");
    }
  };

  return (
    <Layout>
      <section className="space-y-6">
        <h1 className={styles.title}>Minha Conta</h1>
        <div className={styles.panelGrid}>
          <div className={styles.statCard + " cursor-pointer"} onClick={handleSecurityClick}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Segurança</p>
              <ShieldCheck className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Gerencie email e senha</p>
          </div>

          <Link to="/profile/billing" className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Assinatura</p>
              <CreditCard className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Plano atual e pagamentos</p>
          </Link>

          <Link to="/workspace/projects" className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Projetos</p>
              <FileText className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Acesse seus projetos</p>
          </Link>

          <Link to="/profile/support" className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Suporte</p>
              <HelpCircle className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Central de ajuda</p>
          </Link>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
          <div className="bg-white rounded-lg p-9 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100" onClick={() => setShowModal(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className={styles.subTitle}>Verificação de Segurança</h2>
            <p className="text-sm text-gray-600 mb-2">
              Enviamos um código para seu e-mail. Digite para continuar.
            </p>

            <div className="flex justify-between items-center mb-3">
              <div className="relative w-3/5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Código de segurança"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="w-full pl-10 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
                />
              </div>

              <button
                onClick={verifyCode}
                className="bg-black text-white py-2 px-4 rounded-md text-sm hover:opacity-90 transition"
              >
                Verificar Código
              </button>
            </div>

            {error && (
              <div className="flex justify-center">
                <p className="text-sm text-red-500 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={requestCode}
              disabled={!canResend}
              className="w-full mt-4 text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {canResend ? "Reenviar código" : `Reenviar em ${resendCooldown}s`}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
