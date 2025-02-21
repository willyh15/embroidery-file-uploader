const [qrCode, setQrCode] = useState("");

const generateMfa = async () => {
  const response = await fetch("/api/generate-mfa");
  const data = await response.json();
  setQrCode(data.secret);
};

<button onClick={generateMfa}>Enable MFA</button>
{qrCode && <img src={qrCode} alt="Scan this QR code" />}
