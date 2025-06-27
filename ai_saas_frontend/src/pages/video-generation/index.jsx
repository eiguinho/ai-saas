import { useState } from 'react';
import styles from './video.module.css';
import Layout from "../../components/layout/Layout";
import { CircleAlert, Send, Settings, Video } from 'lucide-react';

function VideoGeneration() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [time, setTime] = useState(5);
  const [model, setModel] = useState("openai");
  const [style, setStyle] = useState("realistic");
  const percentage = ((time - 1) / (60 - 1)) * 100;

  const handleGenerate = () => {
    // Aqui futuramente integrar com API
    setResult(`Resultado gerado com prompt: "${prompt}"`);
  };

  return (
    <Layout>
      <section className={`${styles.section} space-y-6`}>
        {/* Título e Subtítulo */}
        <div>
          <h1 className={styles.title}>Geração de Vídeo</h1>
          <p className="text-gray-600">Crie vídeos impressionantes usando IA generativa</p>
        </div>
        <div className={`${styles.atentionCard} flex items-center gap-3`}>
          <CircleAlert className="w-4 h-4" />  
          <p className="text-gray-600 text-sm">A geração de vídeo pode levar alguns minutos para ser processada. Você receberá uma notificação quando estiver pronto.</p>
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
                <option value="openai">OpenAI Sora</option>
                <option value="runway">Runway ML</option>
                <option value="synthesia">Synthesia</option>
                <option value="pika">Pika Labs</option>
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
                <option value="realistic">Realista</option>
                <option value="animated">Animado</option>
                <option value="cinematic">Cinematográfico</option>
                <option value="documentary">Documentário</option>
                <option value="artistic">Artístico</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className={styles.blockTitle}>Duração: {time} segundos</label>
              <input
                type="range"
                min="1" 
                max="60" 
                step="1" 
                value={time} 
                onChange={(e) => setTime(parseInt(e.target.value))} 
                className={styles.inputRangeCustom} 
                style={{ '--range-percent': `${percentage}%` }}                
              />
              <p className="mt-1 text-gray-600 text-xs">
                Custo estimado: ${(time * 0.05).toFixed(2)}
              </p>
            </div>
          </div>
          <div className={`${styles.statCard} flex flex-col flex-1`}>
            <p className={styles.blockSubtitle}>Prompt</p>
            <p className={`${styles.statSubtext} text-sm`}>Descreva o vídeo que você gostaria de gerar</p>
            <div className="flex flex-col mt-6">
              <textarea
                  placeholder="Ex: Um gato caminhando lentamente por um jardim florido ao pôr do sol, câmera seguindo suavemente, estilo cinematográfico..."
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
                <span className="text-sm">Gerar Vídeo</span>
                </button>
              </div> 
          </div>
        </div>
        {/* Resultado */}
        <div className={styles.panelGrid}>
        <div className={`${styles.statCard} flex flex-col flex-1 col-start-2`}>
            <p className={styles.blockSubtitle}>Vídeo Gerado</p>
            <p className={`${styles.statSubtext} text-sm`}>Seu vídeo criado pela IA</p>
            <div className="flex flex-col flex-1 justify-center items-center text-center min-h-[35vh] space-y-2">
              <Video className="w-16 h-16 text-gray-300" />  
              <p className="text-gray-500">O vídeo gerado aparecerá aqui</p>
              <p className="text-gray-500 text-sm">A geração pode levar alguns minutos</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default VideoGeneration;