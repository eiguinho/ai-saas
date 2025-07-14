import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ImageIcon, UserCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../profile.module.css";
import Layout from "../../../components/layout/Layout";

export default function Security() {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="space-y-6">
        <Link to="/profile" className={styles.returnLink}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Profile
        </Link>
        <h1 className={styles.title}>Segurança</h1>
        <div className={styles.panelGrid}>

          <div className={styles.statCard + " cursor-pointer"} onClick={() => navigate("/profile/security/name")}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Nome completo</p>
              <UserCircle2 className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={styles.statSubtext}>Editar nome de exibição</p>
          </div>

          <div className={styles.statCard + " cursor-pointer"} onClick={() => navigate("/profile/security/username")}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Usuário</p>
              <User className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={styles.statSubtext}>Editar nome de usuário</p>
          </div>

          <div className={styles.statCard + " cursor-pointer"} onClick={() => navigate("/profile/security/email")}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Email</p>
              <Mail className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={styles.statSubtext}>Alterar endereço de email</p>
          </div>

          <div className={styles.statCard + " cursor-pointer"} onClick={() => navigate("/profile/security/password")}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Senha</p>
              <Lock className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={styles.statSubtext}>Atualizar senha de acesso</p>
          </div>

          <div className={styles.statCard + " cursor-pointer"} onClick={() => navigate("/profile/security/photo")}>
            <div className={styles.statHeader}>
              <p className={styles.blockTitle}>Foto de Perfil</p>
              <ImageIcon className="w-4 h-4 text-gray-medium" />
            </div>
            <p className={styles.statSubtext}>Atualizar imagem do perfil</p>
          </div>

        </div>
      </section>
    </Layout>
  );
}