import { useEffect, useState } from 'react'
import { checkHealth } from "../../api/api";
import styles from './home.module.css'   // ajuste aqui para CSS Modules
import Layout from "../../components/layout/Layout";
import { Plus, TrendingUp, Image, Video, FileText } from 'lucide-react';
import { Link } from "react-router-dom";

function Home() {
  const [count, setCount] = useState(0);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(data => setHealth(data))
      .catch(err => setError(err.message));
  }, []);

  return (
      <Layout>
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            {/* Título e Botão */}
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className="text-gray-600">Bem-vindo à sua plataforma de IA generativa</p>
            </div>
            <button className={`${styles.btnBlack} ${styles.btnBlackStandard}`}>
              <Plus className="w-4 h-4" />
              <span className="text-sm">Novo Projeto</span>
            </button>
          </div>
          {/* Cards de Estatísticas */}
          <div className={styles.panelGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <p className={styles.blockTitle}>Tokens Usados</p>
                <TrendingUp className="w-4 h-4 text-gray-medium" />
              </div>
              <p className="text-2xl font-bold">500</p>
              <p className={`${styles.statSubtext} text-xs`}>de 1000 tokens disponíveis</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <p className={styles.blockTitle}>Projetos</p>
                <FileText className="w-4 h-4 text-gray-medium" />
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className={`${styles.statSubtext} text-xs`}>+2 novos este mês</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <p className={styles.blockTitle}>Conteúdo Gerado</p>
                <Image className="w-4 h-4 text-gray-medium" />
              </div>
              <p className="text-2xl font-bold">48</p>
              <p className={`${styles.statSubtext} text-xs`}>itens criados</p>
            </div>
          </div>
          <div>
            <h1 className={styles.subTitle}>Ferramentas de IA</h1>
            <div className={styles.panelGrid}>
              
              <div className={styles.statCard}>
                <div>
                  <div className="bg-primary w-fit p-3 rounded-lg mb-4">
                    <FileText className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">Geração de Texto</h3>
                  <p className={`${styles.statSubtext} text-sm`}>Crie conteúdo usando LLMs avançados</p>       
                </div>
                <Link to="/text-generation" className={`${styles.btnBlack} ${styles.btnBlackWide}`}>
                  Começar
                </Link>
              </div>

              <div className={styles.statCard}>
                <div>
                  <div className="bg-accent-purple w-fit p-3 rounded-lg mb-4">
                    <Image className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">Geração de Imagem</h3>
                  <p className={`${styles.statSubtext} text-sm`}>Gere imagens a partir de prompts</p>
                </div>
                <Link to="/image-generation" className={`${styles.btnBlack} ${styles.btnBlackWide}`}>
                  Começar
                </Link>
              </div>

              <div className={styles.statCard}>
                <div>
                  <div className="bg-success w-fit p-3 rounded-lg mb-4">
                    <Video className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">Geração de Vídeo</h3>
                  <p className={`${styles.statSubtext} text-sm`}>Crie vídeos com IA generativa</p>
                </div>
                <Link to="/video-generation" className={`${styles.btnBlack} ${styles.btnBlackWide}`}>
                  Começar
                </Link>
              </div>
            </div>
          </div>
          {/* Projetos Recentes */}
          <div>
            <h2 className={styles.subTitle}>Projetos Recentes</h2>
            <div className={`${styles.blockCard} divide-y divide-gray-300`}>
              {[
                { title: "Campanha Marketing", type: "Texto", time: "2 horas atrás" },
                { title: "Logos Empresa", type: "Imagem", time: "1 dia atrás" },
                { title: "Vídeo Produto", type: "Vídeo", time: "3 dias atrás" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-black mb-1">{item.title}</p>
                    <p className={`${styles.statSubtext} text-sm`}>{item.type}</p>
                  </div>
                  <p className={`${styles.statSubtext} text-sm`}>{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
  )
}

export default Home;