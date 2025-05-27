import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "../theme";
import { CustomToaster } from "../components/CustomToaster";

function CSSChecker() {
  React.useEffect(() => {
    console.log("🔍 Loaded styleSheets:");
    Array.from(document.styleSheets).forEach((ss) => console.log("  ", ss.href));
  }, []);
  return null;
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      {/* ensure dark mode on load */}
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <CustomToaster />
      <CSSChecker />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}