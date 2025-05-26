// pages/_app.js
import "../styles/globals.generated.css";
import { CustomToaster } from "../components/CustomToaster";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

function CSSChecker() {
  useEffect(() => {
    console.log("🔍 Loaded styleSheets:");
    Array.from(document.styleSheets).forEach((ss) => {
      console.log("  ", ss.href);
    });
  }, []);
  return null;
}

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // global JS errors
    window.onerror = (message, source, lineno, colno, error) => {
      const msg = `${message} at ${source}:${lineno}:${colno}`;
      console.error("Global error:", error || msg);
      toast.error(`🚨 JS Error: ${message}`, { duration: 8000 });
    };
    // uncaught promise rejections
    window.onunhandledrejection = (event) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      toast.error(`🚨 Unhandled Rejection: ${event.reason}`, { duration: 8000 });
    };
  }, []);

  return (
    <>
      <CustomToaster />
      <CSSChecker />
      <Component {...pageProps} />
    </>
  );
}