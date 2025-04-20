import "../styles/globals.css";
import { CustomToaster } from "../components/CustomToaster"; // <- ADD THIS

function MyApp({ Component, pageProps }) {
  return (
    <>
      <CustomToaster /> {/* <- Insert Toaster Global */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;