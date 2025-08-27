import { useNavigate } from "react-router-dom";
import { Users, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./admin.module.css";
import Layout from "../../components/layout/Layout";

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <Layout>

      <section className="space-y-6">
        <h1 className={styles.title}>Painel Administrativo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`${styles.modernCard} ${styles.modernCardBlue}`}
            onClick={() => navigate("/admin/users")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && navigate("/admin/users")}
          >
            <Users size={32} className="text-indigo-600" />
            <h2 className="text-lg font-semibold mt-2">Usuários</h2>
            <p className="text-sm text-gray-500">
              Ver e gerenciar todos os usuários
            </p>
          </div>

          <div
            className={`${styles.modernCard} ${styles.modernCardGreen}`}
            onClick={() => navigate("/admin/users/create")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) =>
              e.key === "Enter" && navigate("/admin/users/create")
            }
          >
            <UserPlus size={32} className="text-green-600" />
            <h2 className="text-lg font-semibold mt-2">Cadastrar Usuário</h2>
            <p className="text-sm text-gray-500">Criar uma nova conta</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
