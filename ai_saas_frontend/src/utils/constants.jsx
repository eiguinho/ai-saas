export const TEXT_MODELS = [
  { value: "gpt-4o", label: "GPT-4o", attachments: true },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", attachments: true },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", attachments: true },
  { value: "o1", label: "O1", attachments: true },
  { value: "o1-mini", label: "O1 Mini", attachments: true },
  { value: "o3", label: "O3", attachments: true },
  { value: "o3-mini", label: "O3 Mini", attachments: true },
  { value: "o4-mini", label: "O4 Mini", attachments: true },
  { value: "gpt-4.1", label: "GPT-4.1", attachments: true },
  { value: "gpt-5", label: "GPT-5", attachments: true },
  { value: "gpt-5-mini", label: "GPT-5 Mini", attachments: true },
  { value: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek Chat V3", attachments: false },
  { value: "deepseek/deepseek-r1-0528:free", label: "DeepSeek R1 0528", attachments: false },
  { value: "tngtech/deepseek-r1t2-chimera:free", label: "DeepSeek R1T2 Chimera", attachments: false },
  { value: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash Exp", attachments: false },
];

export const IMAGE_MODELS = [
  { value: "dall-e-3", label: "DALL·E 3" },
  { value: "midjourney", label: "Midjourney" },
  { value: "stable-diffusion", label: "Stable Diffusion" },
  { value: "adobe-firefly", label: "Adobe Firefly" },
];

export const VIDEO_MODELS = [
  { value: "openai-sora", label: "OpenAI Sora" },
  { value: "runway-ml", label: "Runway ML" },
  { value: "synthesia", label: "Synthesia" },
  { value: "pika-labs", label: "Pika Labs" },
];

export const IMAGE_STYLES = [
  { value: "realist", label: "Fotorrealista" },
  { value: "artist", label: "Artístico" },
  { value: "cartoon", label: "Cartoon" },
  { value: "abstract", label: "Abstrato" },
  { value: "digital", label: "Arte Digital" },
];

export const VIDEO_STYLES = [
  { value: "realist", label: "Realista" },
  { value: "animated", label: "Animado" },
  { value: "cinematic", label: "Cinematográfico" },
  { value: "documentary", label: "Documentário" },
  { value: "artistic", label: "Artístico" },
];

export const IMAGE_RATIOS = [
  { value: "square", label: "Quadrado (1:1)" },
  { value: "landscape", label: "Paisagem (16:9)" },
  { value: "portrait", label: "Retrato (9:16)" },
  { value: "classic", label: "Clássico (4:3)" },
  { value: "smallportrait", label: "Retrato (3:4)" },
];

export const TAB_TYPES = [
  { value: "text", label: "Textos" },
  { value: "image", label: "Imagens" },
  { value: "video", label: "Vídeos" },
];