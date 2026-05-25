import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0A0908",
        panel:     "#13110E",
        panel2:    "#1A1713",
        border:    "#3D352B",
        borderHi:  "#5A4E3B",
        amber:     "#FFC04D",
        amberDim:  "#D99A2B",
        ink:       "#FBF1E0",
        inkMid:    "#D4C19A",
        inkLow:    "#A99070",
        threat:    "#FF6E5E",
        ok:        "#B6D17F",
        warn:      "#FFC04D"
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
