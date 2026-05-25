import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper:   "#F8F4ED",
        paper2:  "#F1ECE2",
        paper3:  "#E6DECF",
        ink:     "#0E0C0A",
        ink2:    "#3A332A",
        ink3:    "#857A6B",
        rule:    "#D5C9B1",
        ruleHi:  "#B9AC91",
        burgundy:"#7D1F1F",
        slate:   "#2A3640",
        gold:    "#9B7E3C"
      },
      fontFamily: {
        display: ['"Bodoni Moda"', "Didot", "Georgia", "serif"],
        body:    ['"Crimson Pro"', "Georgia", "serif"],
        mono:    ['"DM Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"]
      },
      letterSpacing: {
        small: "0.16em",
        smallcaps: "0.24em",
        masthead: "0.06em"
      }
    }
  },
  plugins: []
};
export default config;
