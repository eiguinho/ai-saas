import { useState, useEffect } from "react";
import { UserCircle2, UserCog, Trash2, FileText } from "lucide-react";
import Layout from "../../components/layout/Layout";
import styles from "./settings.module.css";
import SettingsModal from "../../components/modals/SettingsModal";
import SecurityModal from "../../components/modals/SecurityModal";
import { useProjects } from "../../hooks/useProjects";
import { useContents } from "../../hooks/useContents";
import { userRoutes } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function Settings() {
  const [user, setUser] = useState(null);
  const { projects } = useProjects(user);
  const { contents } = useContents(user);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteVerifyModal, setShowDeleteVerifyModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(userRoutes.getCurrentUser(), { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => toast.error("Erro ao carregar dados do usuário"));
  }, []);

  const requestSecurityCode = async () => {
    setErrorMessage("");
    try {
      const res = await fetch("/api/email/send-security-code", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Código enviado para seu e-mail.");
    } catch {
      setErrorMessage("Erro ao enviar o código. Tente novamente.");
    }
  };

  const verifySecurityCode = async (code) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/email/verify-security-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error("Código inválido.");
      setShowDeleteVerifyModal(false);
      setShowDeleteConfirmModal(true);
      toast.success("Código verificado com sucesso!");
    } catch {
      setErrorMessage("Código incorreto ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch(userRoutes.deleteUser(user?.id), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Conta deletada com sucesso!");
      window.location.href = "/";
    } catch {
      toast.error("Erro ao deletar a conta.");
    } finally {
      setLoading(false);
      setShowDeleteConfirmModal(false);
    }
  };

  return (
    <Layout>
      <section className="space-y-6">
        <h1 className={styles.title}>Configurações</h1>
        <div className={styles.panelGrid}>
          <div className={`${styles.statCard} cursor-pointer`} onClick={() => setShowPlanModal(true)}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Plano</p>
              <UserCog className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Gerencie seu plano</p>
          </div>
          <div className={`${styles.statCard} cursor-pointer`} onClick={() => setShowAccountModal(true)}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Conta</p>
              <UserCircle2 className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Dados e opções da conta</p>
          </div>
          <div
            className={`${styles.statCard} cursor-pointer`}
            onClick={() => {
              setShowDeleteVerifyModal(true);
              requestSecurityCode();
            }}
          >
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Deletar Conta</p>
              <Trash2 className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={`${styles.statSubtext} text-sm`}>Encerrar conta permanentemente</p>
          </div>
        </div>
      </section>

      <SettingsModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Gerenciar Plano"
        description="Aqui você poderá gerenciar seu plano e pagamentos."
      >
        {user ? (
          <>
            <p className="text-gray-700 text-sm">
              <strong className="font-semibold text-gray-900 text-sm">Plano atual:</strong> {user.plan || "Não informado"}
            </p>
            <p className="text-gray-700 text-sm mt-2">
              <strong className="font-semibold text-gray-900 text-sm">Tokens usados:</strong> {user.tokens_used ?? 0}
            </p>
            <div className="flex mt-8">
              <Link
                to="/subscription"
                className="flex items-center gap-1 px-4 py-2 text-sm rounded-md bg-black text-white hover:opacity-90 transition ml-auto"
              >
                Detalhes do Plano <FileText className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <p>Carregando...</p>
        )}
      </SettingsModal>

      <SettingsModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Minha Conta"
        description="Confira seus dados e estatísticas"
      >
        {user ? (
          <>
            <p className="text-gray-700 text-sm">
              <strong className="font-semibold text-gray-900 text-sm">Nome:</strong> {user.full_name || "N/A"}
            </p>
            <p className="text-gray-700 text-sm">
              <strong className="font-semibold text-gray-900 text-sm">E-mail:</strong> {user.email || "N/A"}
            </p>
            <p className="text-gray-700 text-sm">
              <strong className="font-semibold text-gray-900 text-sm">Conteúdos gerados:</strong> {contents.length}
            </p>
            <p className="text-gray-700 text-sm">
              <strong className="font-semibold text-gray-900 text-sm">Projetos gerados:</strong> {projects.length}
            </p>
            <p className="text-gray-700 text-sm">
              <strong className="font-semibold text-gray-900 text-sm">Conta criada em:</strong>{" "}
              {new Date(user.created_at).toLocaleDateString("pt-BR")}
            </p>
          </>
        ) : (
          <p>Carregando...</p>
        )}
      </SettingsModal>

      <SecurityModal
        isOpen={showDeleteVerifyModal}
        onClose={() => setShowDeleteVerifyModal(false)}
        onVerify={verifySecurityCode}
        onRequestCode={requestSecurityCode}
        loading={loading}
        errorMessage={errorMessage}
      />

      <SettingsModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirmar exclusão"
        description="Tem certeza que deseja deletar sua conta? Esta ação é permanente e não poderá ser desfeita."
      >
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setShowDeleteConfirmModal(false)}
            className="py-2 px-4 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="py-2 px-4 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deletando..." : "Deletar Conta"}
          </button>
        </div>
      </SettingsModal>
    </Layout>
  );
}
