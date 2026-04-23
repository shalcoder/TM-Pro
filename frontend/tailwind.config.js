/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#09090b",
        "dark-surface": "#121214",
        "dark-card": "#18181b",
        "border-subtle": "rgba(255, 255, 255, 0.06)",
      },
    },
  },
  plugins: [],
}
