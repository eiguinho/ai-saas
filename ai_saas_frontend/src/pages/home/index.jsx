import { useEffect, useState } from 'react'
import { checkHealth } from "../../api/api";
import './styles.css'
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
              <h1 className="title">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo à sua plataforma de IA generativa</p>
            </div>
            <button className="btn-black btn-black-standard">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Novo Projeto</span>
            </button>
          </div>
          {/* Cards de Estatísticas */}
          <div className="panel-grid">
            <div className="stat-card">
              <div className="stat-header">
                <p className="block-title">Tokens Usados</p>
                <TrendingUp className="w-4 h-4 text-gray-medium" />
              </div>
              <p className="text-2xl font-bold">500</p>
              <p className="stat-subtext text-xs">de 1000 tokens disponíveis</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <p className="block-title">Projetos</p>
                <FileText className="w-4 h-4 text-gray-medium" />
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="stat-subtext text-xs">+2 novos este mês</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <p className="block-title">Conteúdo Gerado</p>
                <Image className="w-4 h-4 text-gray-medium" />
              </div>
              <p className="text-2xl font-bold">48</p>
              <p className="stat-subtext text-xs">itens criados</p>
            </div>
          </div>
          <div>
            <h1 className="sub-title">Ferramentas de IA</h1>
            <div className="panel-grid">
              
              <div className="stat-card">
                <div>
                  <div className="bg-primary w-fit p-3 rounded-lg mb-4">
                    <FileText className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">Geração de Texto</h3>
                  <p className="stat-subtext text-sm">Crie conteúdo usando LLMs avançados</p>       
                </div>
                <Link to="/texto" className="btn-black btn-black-wide">
                  Começar
                </Link>
              </div>

              <div className="stat-card">
                <div>
                  <div className="bg-accent-purple w-fit p-3 rounded-lg mb-4">
                    <Image className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">Geração de Imagem</h3>
                  <p className="stat-subtext text-sm">Gere imagens a partir de prompts</p>
                </div>
                <Link to="/imagem" className="btn-black btn-black-wide">
                  Começar
                </Link>
              </div>

              <div className="stat-card">
                <div>
                  <div className="bg-success w-fit p-3 rounded-lg mb-4">
                    <Video className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">Geração de Vídeo</h3>
                  <p className="stat-subtext text-sm">Crie vídeos com IA generativa</p>
                </div>
                <Link to="/video" className="btn-black btn-black-wide">
                  Começar
                </Link>
              </div>
            </div>
          </div>
          {/* Projetos Recentes */}
          <div>
            <h2 className="sub-title">Projetos Recentes</h2>
            <div className="block-card divide-y divide-gray-300">
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
                    <p className="stat-subtext text-sm">{item.type}</p>
                  </div>
                  <p className="stat-subtext text-sm">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
  )
}

export default Home;
