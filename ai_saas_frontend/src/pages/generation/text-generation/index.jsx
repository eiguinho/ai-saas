import { useState } from 'react';
import styles from './text.module.css';
import Layout from "../../../components/layout/Layout";
import { Loader2, Send, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { generatedContentRoutes, notificationRoutes, aiRoutes } from '../../../services/apiRoutes';
import { useNotifications } from "../../../context/NotificationContext";
import { TEXT_MODELS } from "../../../utils/constants";

function TextGeneration() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [model, setModel] = useState("gpt-4o");
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();
  const isTemperatureLocked = model.startsWith("o") || model.startsWith("gpt-5");

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
    const aiRes = await fetch(aiRoutes.generateText, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, temperature: isTemperatureLocked ? 1 : temperature, max_tokens: maxTokens }),
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json();
      throw new Error(errorData.error || "Erro ao gerar texto");
    }

    const aiData = await aiRes.json();

    const saveRes = await fetch(generatedContentRoutes.create, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_type: "text",
        prompt: aiData.prompt,
        model_used: aiData.model_used,
        temperature: isTemperatureLocked ? 1 : aiData.temperature,
        content_data: aiData.generated_text,
        file_path: null
      }),
    });

    if (!saveRes.ok) {
      const errorSave = await saveRes.json();
      throw new Error(errorSave.error || "Erro ao salvar texto");
    }

    const savedData = await saveRes.json();
    setResult(savedData.content.content_data);
    toast.success("Texto gerado e salvo com sucesso!");

    await fetch(notificationRoutes.create, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Texto gerado com sucesso: "${prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt}"`,
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
                {TEXT_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col mb-4">
              <label className={styles.blockTitle}>
                Temperatura: {isTemperatureLocked ? "1 (fixa)" : temperature}
              </label>
              {!isTemperatureLocked ? (
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
              ) : (
                <p className="text-sm text-gray-500">
                  Este modelo não permite ajuste de temperatura.
                </p>
              )}
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
        <div className={`${styles.statCard} flex flex-col flex-1 col-start-1 md:col-start-2`}>
          <div className="mb-2">
            <p className={styles.blockSubtitle}>Resultado</p>
            <p className={`${styles.statSubtext} text-sm`}>Texto gerado pela IA</p>
          </div>
          <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[20vh] max-h-[60vh] overflow-y-auto">
            {result ? (
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">{result}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">O texto gerado aparecerá aqui</p>
            )}
          </div>
        </div>
      </div>
      </section>
    </Layout>
  );
}

export default TextGeneration;