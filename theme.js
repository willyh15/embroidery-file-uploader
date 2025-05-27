// theme.js
import { extendTheme, keyframes } from "@chakra-ui/react";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  primaryBg: "#2B1F34",      // Darker rich purple
  primaryTxt: "#F7D1DE",     // Soft pinkish text
  secondaryBg: "#3A2B47",    // Deep muted purple for panels
  accent: "#FCA3B7",         // Soft neon pink for highlights
  accentAlt: "#C4D9D4",      // Soft mintish accent
  border: "rgba(255,255,255,0.15)",  // Slightly lighter border
  shadow: "rgba(0,0,0,0.6)",          // Stronger shadow
  neonPink: "#FF488E",
  neonCyan: "#48FFE6",
  neonYellow: "#FFC948",
  glowPink: "rgba(255, 72, 142, 0.35)",
  glowCyan: "rgba(72, 255, 230, 0.25)",
};

const styles = {
  global: {
    body: {
      bg: "primaryBg",
      color: "primaryTxt",
      fontFamily: "Montserrat, sans-serif",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      userSelect: "none",  // Optional: prevent accidental text selection for cleaner UX
    },
    "h1,h2,h3,h4,h5,h6": {
      fontFamily: "Quicksand, sans-serif",
      fontWeight: "bold",
      color: "primaryTxt",
      userSelect: "text",
    },
    ".modal-overlay": {
      position: "fixed",
      inset: 0,
      bg: "blackAlpha.700",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 4,
      zIndex: 9999,
    },
    ".glass-panel": {
      bg: "whiteAlpha.100",
      backdropFilter: "blur(12px) saturate(180%)",
      border: "1px solid",
      borderColor: "border",
      borderRadius: "2xl",
      boxShadow: "0 12px 48px rgba(0, 0, 0, 0.35)",
      p: 6,
      color: "primaryTxt",
    },
    "input::placeholder": {
      color: "gray.400",
      opacity: 0.7,
    },
    "::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      backgroundColor: "accent",
      borderRadius: "24px",
      border: "2px solid transparent",
      backgroundClip: "content-box",
    },
  },
};

const components = {
  Button: {
    baseStyle: { rounded: "full", fontWeight: "semibold" },
    variants: {
      primary: {
        bgGradient: "linear(to-r, neonPink, neonCyan)",
        color: "white",
        _hover: { bgGradient: "linear(to-r, neonCyan, neonPink)" },
        _active: { transform: "scale(0.95)" },
        boxShadow: "0 4px 14px rgba(255, 72, 142, 0.6)",
      },
      accent: {
        bgGradient: "linear(to-r, neonYellow, accent)",
        color: "primaryBg",
        _hover: { bgGradient: "linear(to-r, accentAlt, neonYellow)" },
        boxShadow: "0 4px 14px rgba(252, 163, 183, 0.6)",
      },
      outline: {
        border: "1px solid",
        borderColor: "accent",
        color: "accent",
        _hover: { bg: "accent", color: "white" },
      },
      danger: {
        bgGradient: "linear(to-r, red.500, pink.500)",
        _hover: { bgGradient: "linear(to-r, red.600, pink.600)" },
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: "whiteAlpha.100",
          borderColor: "border",
          color: "primaryTxt",
          _placeholder: { color: "gray.400" },
          _focus: { ring: 2, ringColor: "accent" },
          _hover: { borderColor: "accent" },
          transition: "all 0.2s",
        },
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  fonts: {
    heading: "Quicksand, sans-serif",
    body: "Montserrat, sans-serif",
  },
  radii: { xl: "1.5rem" },
  keyframes: {
    gradientShift,
  },
});

export default theme;