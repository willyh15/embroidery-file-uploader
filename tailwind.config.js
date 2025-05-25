// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // your core palette
        primaryBg:   "#33202E",
        primaryTxt:  "#FBD3E0",
        secondaryBg: "#44303D",
        accent:      "#F4A9A8",
        accentAlt:   "#C1D7C3",
        border:      "rgba(255,255,255,0.2)",
        shadow:      "rgba(0,0,0,0.5)",
        // neon pops
        neonPink:    "#FF488E",
        neonCyan:    "#48FFE6",
        neonYellow:  "#FFC948",
      },
      fontFamily: {
        sans:    ["Montserrat", "sans-serif"],
        display: ["Quicksand",   "sans-serif"],
      },
      borderRadius: {
        lg:   "1rem",
        xl:   "1.5rem",
        circle: "50%",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.18)",
      },
      backdropBlur: {
        xs: "2px",
        md: "10px",
        lg: "20px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class"
    }),
  ],
};