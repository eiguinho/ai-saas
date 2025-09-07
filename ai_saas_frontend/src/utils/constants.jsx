export const TEXT_MODELS = [
  { value: "gpt-4o", label: "GPT-4o", attachments: true, isGpt5: false },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", attachments: true, isGpt5: true },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", attachments: true, isGpt5: true },
  { value: "o1", label: "O1", attachments: true, isGpt5: true },
  { value: "o1-mini", label: "O1 Mini", attachments: true, isGpt5: true },
  { value: "o3", label: "O3", attachments: true, isGpt5: true },
  { value: "o3-mini", label: "O3 Mini", attachments: true, isGpt5: true },
  { value: "o4-mini", label: "O4 Mini", attachments: true, isGpt5: true },
  { value: "gpt-4.1", label: "GPT-4.1", attachments: true, isGpt5: true },
  { value: "gpt-5", label: "GPT-5", attachments: true, isGpt5: true },
  { value: "gpt-5-mini", label: "GPT-5 Mini", attachments: true, isGpt5: true },
  { value: "deepseek/deepseek-r1-0528:free", label: "DeepSeek R1 0528", attachments: false, isGpt5: false },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", attachments: true, isGpt5: true },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", attachments: true, isGpt5: true },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", attachments: true, isGpt5: false },
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