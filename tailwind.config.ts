import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        saheb: {
          50: "#eff6ff",
          500: "#2563eb",
          700: "#1d4ed8",
          900: "#172554",
        },
      },
      fontFamily: { sans: ["var(--font-geist-sans)", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
