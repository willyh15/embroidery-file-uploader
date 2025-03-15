import { useState, useEffect } from "react";

export default function MFASetup() {
  const [mfaSecret, setMfaSecret] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const fetchMfaSecret = async () => {
      try {
        const response = await fetch("/api/generate-mfa");
        const data = await response.json();
        setMfaSecret(data.secret);
        setQrCode(data.qrCode);
      } catch (error) {
        console.error("Error fetching MFA secret:", error);
      }
    };

    fetchMfaSecret();
  }, []);

  const verifyMfa = async () => {
    const response = await fetch("/api/verify-mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: mfaCode }),
    });

    const data = await response.json();
    if (data.success) alert("MFA Setup Successful!");
    else alert("MFA Verification Failed.");
  };

  return (
    <div>
      <h1>Multi-Factor Authentication Setup</h1>
      {qrCode && <img src={qrCode} alt="MFA QR Code" />}
      <input
        type="text"
        placeholder="Enter MFA Code"
        value={mfaCode}
        onChange={(e) => setMfaCode(e.target.value)}
      />
      <button onClick={verifyMfa}>Verify MFA</button>
    </div>
  );
}