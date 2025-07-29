import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, FileText, HelpCircle, CreditCard } from "lucide-react";
import styles from "./profile.module.css";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { emailRoutes } from "../../services/apiRoutes";
import SecurityModal from "../../components/modals/SecurityModal";

export default function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { securityVerified, setSecurityVerified } = useAuth();

  const requestCode = async () => {
    try {
      const res = await fetch(emailRoutes.sendSecurityCode, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Código enviado para seu e-mail.");
    } catch {
      setErrorMessage("Erro ao enviar o código. Tente novamente.");
    }
  };

  const handleSecurityClick = async () => {
    if (securityVerified) {
      navigate("/profile/security");
      return;
    }
    setErrorMessage("");
    setShowModal(true);
    await requestCode();
  };

  const verifyCode = async (code) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(emailRoutes.verifySecurityCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error("Código inválido.");
      toast.success("Código verificado com sucesso!");
      setShowModal(false);
      setSecurityVerified(true);
      navigate("/profile/security");
    } catch {
      setErrorMessage("Código incorreto ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="space-y-6">
        <h1 className={styles.title}>Minha Conta</h1>
        <div className={styles.panelGrid}>
          <div
            className={`${styles.statCard} cursor-pointer`}
            onClick={handleSecurityClick}
          >
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Segurança</p>
              <ShieldCheck className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>
              Gerencie email e senha
            </p>
          </div>

          <Link to="/profile/billing" className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Assinatura</p>
              <CreditCard className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>
              Plano atual e pagamentos
            </p>
          </Link>

          <Link to="/workspace/projects" className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Projetos</p>
              <FileText className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>
              Acesse seus projetos
            </p>
          </Link>

          <Link to="/profile/support" className={styles.statCard}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Suporte</p>
              <HelpCircle className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>
              Central de ajuda
            </p>
          </Link>
        </div>
      </section>

      <SecurityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVerify={verifyCode}
        onRequestCode={requestCode}
        loading={loading}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}