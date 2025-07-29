import { useState } from 'react';
import styles from './text.module.css';
import Layout from "../../../components/layout/Layout";
import { Loader2, Send, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { generatedContentRoutes, notificationRoutes } from '../../../services/apiRoutes';
import { useNotifications } from "../../../context/NotificationContext";

function TextGeneration() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [model, setModel] = useState("gpt-4");
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();

  const percentage = ((maxTokens - 100) / (2000 - 100)) * 100;
  const percentageTemperature = temperature * 100;

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.warning("Digite um prompt antes de gerar!");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const simulatedText = `prompt: "${prompt}"

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin at diam ac erat suscipit tempus.
Curabitur euismod, lorem at viverra luctus, sapien arcu ullamcorper ligula, at malesuada leo urna a lorem.
Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.`;

      const res = await fetch(generatedContentRoutes.create, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "text",
          prompt,
          model_used: model,
          temperature: temperature,
          content_data: simulatedText,
          file_path: null
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar texto gerado");
      const data = await res.json();
      setResult(data.content.content_data || simulatedText);
      toast.success("Texto gerado (simulado) e salvo com sucesso!");
      await fetch(notificationRoutes.create, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Texto gerado com sucesso: "${
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
          <h1 className={styles.title}>Geração de Texto</h1>
          <p className="text-gray-600">Use LLMs avançados para gerar conteúdo de alta qualidade</p>
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
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gemini-pro">Google Gemini Pro</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
            <div className="flex flex-col mb-4">
              <label className={styles.blockTitle}>Temperatura: {temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className={styles.inputRangeCustom}
                style={{ '--range-percent': `${percentageTemperature}%` }}
              />
            </div>
            <div className="flex flex-col">
              <label className={styles.blockTitle}>Max Tokens: {maxTokens}</label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className={styles.inputRangeCustom}
                style={{ '--range-percent': `${percentage}%` }}
              />
            </div>
          </div>
          <div className={`${styles.statCard} flex flex-col flex-1`}>
            <p className={styles.blockSubtitle}>Prompt</p>
            <p className={`${styles.statSubtext} text-sm`}>Descreva o que você gostaria que a IA gere</p>
            <div className="flex flex-col mt-6">
              <textarea
                placeholder="Digite seu prompt aqui..."
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
                className={`${styles.btnBlack} ${styles.btnBlackStandard} flex items-center gap-2`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="text-sm">{loading ? "Gerando..." : "Gerar"}</span>
              </button>
            </div>
          </div>
        </div>
        <div className={styles.panelGrid}>
          <div className={`${styles.statCard} flex flex-col flex-1 col-start-2`}>
            <p className={styles.blockSubtitle}>Resultado</p>
            <p className={`${styles.statSubtext} text-sm`}>Texto gerado pela IA</p>
            <div className="flex flex-1 justify-center items-center text-center min-h-[20vh] px-4">
              {result ? (
                <p className="text-gray-800 whitespace-pre-line text-sm">{result}</p>
              ) : (
                <p className="text-gray-500">O texto gerado aparecerá aqui</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default TextGeneration;