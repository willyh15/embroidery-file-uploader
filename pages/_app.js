// pages/_app.js

import "../styles/globals.css";
import { CustomToaster } from "../components/CustomToaster";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <CustomToaster />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;