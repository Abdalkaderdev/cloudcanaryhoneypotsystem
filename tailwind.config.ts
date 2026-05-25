import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper:   "#F4ECDD",
        paper2:  "#EBE2D1",
        paper3:  "#E1D6BF",
        ink:     "#1B1612",
        ink2:    "#3D332A",
        ink3:    "#7A6A5A",
        rule:    "#C4B5A0",
        ruleHi:  "#A89A85",
        red:     "#A8281E",
        teal:    "#1F3B40",
        ochre:   "#A0823D",
        moss:    "#4F6B3E"
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body:    ['"Fraunces"', "Georgia", "serif"],
        mono:    ['"DM Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"]
      },
      letterSpacing: {
        small: "0.16em",
        smallcaps: "0.22em"
      }
    }
  },
  plugins: []
};
export default config;
