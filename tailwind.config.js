// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primaryBg:   "#33202E",
        primaryTxt:  "#FBD3E0",
        secondaryBg: "#44303D",
        accent:      "#F4A9A8",
        accentAlt:   "#C1D7C3",
        border:      "rgba(255,255,255,0.2)",
        shadow:      "rgba(0,0,0,0.5)",
        neonPink:    "#FF488E",
        neonCyan:    "#48FFE6",
        neonYellow:  "#FFC948",
      },
      fontFamily: {
        sans:    ["Montserrat", ...defaultTheme.fontFamily.sans],
        display: ["Quicksand",  ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        xl:     "1.5rem",
      },
      boxShadow: {
        glass:  "0 8px 32px rgba(0,0,0,0.18)",
      },
      backdropBlur: {
        md:     "10px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
  ],
};