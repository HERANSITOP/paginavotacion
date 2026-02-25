import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1419",
        surface: "#1a2332",
        "surface-hover": "#212d3d",
        text: "#e6edf3",
        muted: "#8b949e",
        accent: "#58a6ff",
        success: "#3fb950",
        error: "#f85149",
      },
    },
  },
  plugins: [],
};

export default config;
