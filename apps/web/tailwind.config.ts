import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#f7f1e8",
        ember: "#d97706",
        moss: "#22543d",
        skywash: "#d9eef7",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
      },
      boxShadow: {
        panel: "0 24px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
} satisfies Config;
