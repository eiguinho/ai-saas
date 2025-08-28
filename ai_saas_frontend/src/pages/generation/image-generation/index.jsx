import { useState } from 'react';
import styles from './image.module.css';
import Layout from "../../../components/layout/Layout";
import { Send, Loader2, Image as ImageIcon, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.warning("Digite um prompt antes de gerar!");
      return;
    }
    // Aviso de funcionalidade ainda não implementada
    toast.warning("Geração de imagem ainda será implementada!");
  };

  return (
    <Layout>
      <section className={`${styles.section} space-y-6`}>
        <div>
          <h1 className={styles.title}>Geração de Imagem</h1>
          <p className="text-gray-600">Crie imagens incríveis usando IA generativa</p>
        </div>

        <div className={styles.panelGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Settings className="w-5 h-5 text-black mr-2" />
              <p className={styles.blockSubtitle}>Configurações</p>
            </div>
            {/* Modelos, estilo e proporção permanecem */}
            <div className="flex flex-col mb-2">
              <label htmlFor="model" className={styles.blockTitle}>Modelo</label>
              <select id="model" className={styles.selectClean} disabled>
                <option>DALL·E 3</option>
              </select>
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="style" className={styles.blockTitle}>Estilo</label>
              <select id="style" className={styles.selectClean} disabled>
                <option>Fotorrealista</option>
              </select>
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="ratio" className={styles.blockTitle}>Proporção</label>
              <select id="ratio" className={styles.selectClean} disabled>
                <option>Quadrado (1:1)</option>
              </select>
            </div>
          </div>

          <div className={`${styles.statCard} flex flex-col flex-1`}>
            <p className={styles.blockSubtitle}>Prompt</p>
            <p className={`${styles.statSubtext} text-sm`}>Descreva a imagem que você gostaria de gerar</p>
            <textarea
              placeholder="Ex: Um gato laranja sentado em uma janela olhando para a chuva, estilo fotorrealista, iluminação suave..."
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md mt-6"
            />
            <div className="flex justify-between items-center mt-6">
              <p className={`${styles.statSubtext} text-sm`}>{prompt.length} caracteres</p>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`${styles.btn} ${styles.btnStandard} flex items-center gap-2`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="text-sm">{loading ? "Gerando..." : "Gerar Imagem"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.panelGrid}>
          <div className={`${styles.statCard} flex flex-col flex-1 col-start-2`}>
            <p className={styles.blockSubtitle}>Imagem Gerada</p>
            <p className={`${styles.statSubtext} text-sm`}>Sua imagem criada pela IA</p>
            <div className="flex flex-col flex-1 justify-center items-center text-center min-h-[35vh] space-y-2">
              <ImageIcon className="w-16 h-16 text-gray-300" />
              <p className="text-gray-500">A imagem gerada aparecerá aqui</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default ImageGeneration;
