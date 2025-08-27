import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import SettingsModal from "../../components/modals/SettingsModal";
import { UserCheck, TrendingUp } from "lucide-react"; // ícones modernos
import styles from "./subscription.module.css";

export default function Subscription() {
  const [user, setUser] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  const tokensUsedPercent = user
    ? Math.min(100, Math.round((user.tokens_used / (user.tokens_available + user.tokens_used)) * 100))
    : 0;

  return (
    <Layout>
      <section className={styles.container}>
        <h1 className={styles.title}>Assinatura</h1>

        <div className={styles.grid}>
          {/* Plano Atual */}
          <div
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => setShowInfoModal(true)}
            onKeyDown={(e) => e.key === "Enter" && setShowInfoModal(true)}
          >
            <div className={styles.iconWrapper}>
              <UserCheck size={40} color="#4ade80" />
            </div>
            <h2 className={styles.cardTitle}>Seu Plano Atual</h2>
            {user ? (
              <>
                <p className={styles.planName}>{user.plan || "Não informado"}</p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${tokensUsedPercent}%` }}
                    aria-label={`${tokensUsedPercent}% tokens usados`}
                  />
                </div>
                <p className={styles.tokenText}>
                  Tokens usados: <strong>{user.tokens_used ?? 0}</strong> /{" "}
                  <strong>{user.tokens_available + user.tokens_used ?? 0}</strong>
                </p>
                <p className={styles.tokenPercent}>{tokensUsedPercent}% usado</p>
              </>
            ) : (
              <p>Carregando...</p>
            )}
          </div>

          {/* Upgrade */}
          <div
            className={`${styles.card} ${styles.upgradeCard}`}
            role="button"
            tabIndex={0}
            onClick={() => setShowUpgradeModal(true)}
            onKeyDown={(e) => e.key === "Enter" && setShowUpgradeModal(true)}
          >
            <div className={styles.iconWrapper}>
              <TrendingUp size={40} color="#facc15" />
            </div>
            <h2 className={styles.cardTitle}>Melhorar Plano</h2>
            <p className={styles.description}>
              Melhore seu plano na ARTIFICIALL para obter mais funcionalidades!
            </p>
            <button disabled className={styles.upgradeBtn} title="Funcionalidade ainda não implementada">
              Contate-nos
            </button>
          </div>
        </div>
      </section>

      {/* Modal info */}
      <SettingsModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Informações do Plano"
        description="Detalhes do seu plano atual"
      >
        {user ? (
            <>
                <p className="text-gray-700 text-sm">
                <strong className="font-semibold text-gray-900 text-sm">Plano:</strong> {user.plan || "Não informado"}
                </p>
                <p className="text-gray-700 text-sm">
                <strong className="font-semibold text-gray-900 text-sm">Tokens disponíveis:</strong> {user.tokens_available ?? 0}
                </p>
                <p className="text-gray-700 text-sm">
                <strong className="font-semibold text-gray-900 text-sm">Tokens usados:</strong> {user.tokens_used ?? 0}
                </p>
            </>
            ) : (
            <p>Carregando...</p>
            )}
      </SettingsModal>

      {/* Modal upgrade */}
      <SettingsModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Plano Premium"
        description="O plano Premium oferece 1000 tokens adicionais e suporte prioritário."
      >
        <p className={styles.upgradeText}>
          Com o plano Premium você terá acesso a mais tokens, funcionalidades exclusivas e suporte dedicado.
        </p>
        <button disabled className={styles.upgradeBtn} title="Funcionalidade ainda não implementada">
          Adquirir Plano
        </button>
      </SettingsModal>
    </Layout>
  );
}