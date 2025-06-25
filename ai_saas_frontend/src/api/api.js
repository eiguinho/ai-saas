export async function checkHealth() {
  const res = await fetch("http://localhost:5000/api/health");
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}
