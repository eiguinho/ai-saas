import { useState } from 'react';
import styles from './image.module.css';
import Layout from "../../../components/layout/Layout";
import { Loader2, Send, Settings, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { generatedContentRoutes, notificationRoutes } from '../../../services/apiRoutes';
import { useNotifications } from "../../../context/NotificationContext";

function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [model, setModel] = useState("dall-e-3");
  const [style, setStyle] = useState("realist");
  const [ratio, setRatio] = useState("square");
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();

  const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.warning("Digite um prompt antes de gerar!");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      await simulateDelay(2000);
      const simulatedImagePath = "/static/uploads/image.png";
      const simulatedDescription = `Imagem gerada para o prompt: "${prompt}"
  Modelo: ${model}, Estilo: ${style}, Proporção: ${ratio}`;
      const res = await fetch(generatedContentRoutes.create, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "image",
          prompt,
          model_used: model,
          temperature: null,
          content_data: simulatedDescription,
          file_path: simulatedImagePath,
          style,     
          ratio     
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar imagem gerada");
      const data = await res.json();
      setResult(data.content.file_path || simulatedImagePath);
      toast.success("Imagem gerada (simulada) e salva com sucesso!");
      await fetch(notificationRoutes.create, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Imagem gerada com sucesso: "${
            prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt
          }"`,
          link: "/workspace/generated-contents"
        }),
      });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

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
            <div className="flex flex-col mb-2">
              <label htmlFor="model" className={styles.blockTitle}>Modelo</label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={styles.selectClean}
              >
                <option value="dall-e-3">DALL·E 3</option>
                <option value="midjourney">Midjourney</option>
                <option value="stable-diffusion">Stable Diffusion</option>
                <option value="adobe-firefly">Adobe Firefly</option>
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
              {result ? (
                <img
                  src={result}
                  alt="Imagem gerada"
                  className="max-w-full max-h-[30vh] rounded-lg shadow-md"
                />
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                  <p className="text-gray-500">A imagem gerada aparecerá aqui</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default ImageGeneration;
