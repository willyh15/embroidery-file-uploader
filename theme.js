// theme.js
import { extendTheme } from "@chakra-ui/react";  // v2

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
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
};

const styles = {
  global: {
    body: {
      bg: "primaryBg",
      color: "primaryTxt",
      fontFamily: "Montserrat, sans-serif",
    },
    "h1,h2,h3,h4,h5,h6": {
      fontFamily: "Quicksand, sans-serif",
      fontWeight: "bold",
      color: "primaryTxt",
    },
    ".modal-overlay": {
      position: "fixed",
      inset: 0,
      bg: "blackAlpha.600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 4,
      zIndex: 50,
    },
    ".glass-panel": {
      bg: "whiteAlpha.100",
      backdropFilter: "blur(10px)",
      border: "1px solid",
      borderColor: "border",
      borderRadius: "xl",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      p: 6,
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
      },
      accent: {
        bgGradient: "linear(to-r, neonYellow, accent)",
        color: "primaryBg",
        _hover: { bgGradient: "linear(to-r, accentAlt, neonYellow)" },
      },
      outline: {
        border: "1px solid",
        borderColor: "accent",
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
          _placeholder: { color: "gray.400" },
          _focus: { ring: 2, ringColor: "accent" },
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
});

export default theme;