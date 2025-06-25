/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // Inclui todos os seus componentes
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",     // roxo escuro
        secondary: "#14b8a6",   // ciano
        accent: "#f97316",      // laranja
        neutral: "#1e293b",     // cinza escuro
      },
    },
  },
  plugins: [],
}
