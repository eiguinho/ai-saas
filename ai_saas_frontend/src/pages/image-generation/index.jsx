import { useState } from 'react';
import styles from './image.module.css';
import Layout from "../../components/layout/Layout";
import { Send, Settings, Image } from 'lucide-react';

function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [model, setModel] = useState("dalle");
  const [style, setStyle] = useState("realist");
  const [ratio, setRatio] = useState("square");

  const handleGenerate = () => {
    // Aqui futuramente integrar com API
    setResult(`Resultado gerado com prompt: "${prompt}"`);
  };

  return (
    <Layout>
      <section className={`${styles.section} space-y-6`}>
        {/* Título e Subtítulo */}
        <div>
          <h1 className={styles.title}>Geração de Imagem</h1>
          <p className="text-gray-600">Crie imagens incríveis usando IA generativa</p>
        </div>
        {/* Grid principal */}
        <div className={styles.panelGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Settings className="w-5 h-5 text-black mr-2" />
              <p className={styles.blockSubtitle}>Configurações</p>
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="model" className={styles.blockTitle}>Modelo</label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={styles.selectClean}
              >
                <option value="dalle">DALL-E 3</option>
                <option value="midjourney">Midjourney</option>
                <option value="stable">Stable Diffusion</option>
                <option value="adobe">Adobe Firefly</option>
              </select>
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="style" className={styles.blockTitle}>Estilo</label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={styles.selectClean}
              >
                <option value="realist">Fotorrealista</option>
                <option value="artist">Artístico</option>
                <option value="cartoon">Cartoon</option>
                <option value="abstract">Abstrato</option>
                <option value="digital">Arte Digital</option>
              </select>
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="ratio" className={styles.blockTitle}>Proporção</label>
              <select
                id="ratio"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                className={styles.selectClean}
              >
                <option value="square">Quadrado (1:1)</option>
                <option value="landscape">Paisagem (16:9)</option>
                <option value="portrait">Retrato (9:16)</option>
                <option value="classic">Clássico (4:3)</option>
                <option value="smallportrait">Retrato (3:4)</option>
              </select>
            </div>
          </div>
          <div className={`${styles.statCard} flex flex-col flex-1`}>
            <p className={styles.blockSubtitle}>Prompt</p>
            <p className={`${styles.statSubtext} text-sm`}>Descreva a imagem que você gostaria de gerar</p>
            <div className="flex flex-col mt-6">
              <textarea
                  placeholder="Ex: Um gato laranja sentado em uma janela olhando para a chuva, estilo fotorrealista, iluminação suave..."
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 rounded-lg border text-black border-gray-300 text-sm shadow-sm focus:outline-none focus:shadow-md"
              ></textarea>
            </div>
              <div className="flex justify-between items-center mt-6">
                <p className={`${styles.statSubtext} text-sm`}>
                  {prompt.length} caracteres
                </p>
                <button className={`${styles.btn} ${styles.btnStandard}`}>
                <Send className="w-4 h-4" />
                <span className="text-sm">Gerar Imagem</span>
                </button>
              </div> 
          </div>
        </div>
        {/* Resultado */}
        <div className={styles.panelGrid}>
        <div className={`${styles.statCard} flex flex-col flex-1 col-start-2`}>
            <p className={styles.blockSubtitle}>Imagem Gerada</p>
            <p className={`${styles.statSubtext} text-sm`}>Sua imagem criada pela IA</p>
            <div className="flex flex-col flex-1 justify-center items-center text-center min-h-[35vh] space-y-2">
              <Image className="w-16 h-16 text-gray-300" />  
              <p className="text-gray-500">A imagem gerada aparecerá aqui</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default ImageGeneration;