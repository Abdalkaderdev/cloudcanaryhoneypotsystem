import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0A0908",
        panel:     "#13110E",
        panel2:    "#1A1713",
        border:    "#2A2520",
        borderHi:  "#3D352B",
        amber:     "#FFAB00",
        amberDim:  "#A87600",
        ink:       "#F5E9D7",
        inkMid:    "#9E8E73",
        inkLow:    "#5A4E3B",
        threat:    "#FF4D3F",
        ok:        "#9DBC65",
        warn:      "#FFAB00"
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', "Impact", "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"]
      },
      letterSpacing: {
        wider2: "0.18em",
        widest2: "0.28em"
      }
    }
  },
  plugins: []
};
export default config;
