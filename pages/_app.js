// pages/_app.js
import "../styles/globals.css";
import { CustomToaster } from "../components/CustomToaster";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <CustomToaster />
      <Component {...pageProps} />
    </>
  );
}