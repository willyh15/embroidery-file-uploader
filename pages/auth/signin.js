// pages/auth/signin.js
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignInPage() {
  const router = useRouter();
  const { error } = router.query;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleLogin = async () => {
    setSubmitted(true);
    await signIn("credentials", {
      username,
      password,
      mfaToken,
      callbackUrl: "/admin",
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "5rem auto", textAlign: "center" }}>
      <h2>Sign In</h2>

      {submitted && error === "CredentialsSignin" && (
        <div style={{ color: "white", backgroundColor: "#dc3545", padding: "10px", borderRadius: "4px", marginBottom: "1rem" }}>
          Sign in failed. Check the details you provided are correct.
        </div>
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: "0.5rem", width: "100%", padding: "0.5rem" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: "0.5rem", width: "100%", padding: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="MFA Token (optional)"
        value={mfaToken}
        onChange={(e) => setMfaToken(e.target.value)}
        style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />
      <button
        onClick={handleLogin}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Sign in with Credentials
      </button>
    </div>
  );
}