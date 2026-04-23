/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0c10',
          surface: '#13171f',
          card: '#161b22',
        },
        primary: {
          DEFAULT: '#4f46e5',
          glow: 'rgba(79, 70, 229, 0.3)',
        }
      }
    },
  },
  plugins: [],
}
