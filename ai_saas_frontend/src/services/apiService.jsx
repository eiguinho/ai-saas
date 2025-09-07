// Função para pegar qualquer cookie pelo nome
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Retorna especificamente o CSRF usado pelo Flask-JWT-Extended
export function getCsrfToken() {
  return getCookie("csrf_access_token"); // nome correto
}

// Wrapper para fetch que envia cookies + CSRF token
export async function apiFetch(url, options = {}) {
  const csrfToken = getCsrfToken();

  const headers = {
    ...(options.headers || {}),
    ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}), // nome do header também precisa estar certo
  };

  const fetchOptions = {
    ...options,
    headers,
    credentials: "include", // envia cookies automaticamente
  };

  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Erro na requisição");
    }
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return res.json();
    }
    return res;
  } catch (err) {
    console.error("API fetch error:", err);
    throw err;
  }
}
