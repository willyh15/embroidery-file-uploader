import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Button from "../../components/Button";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destination, setDestination] = useState("admin"); // uploader or admin

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const callbackUrl = destination === "uploader" ? "/" : "/admin";

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      mfaToken,
      callbackUrl,
    });

    if (result?.ok) {
      router.push(result.url || callbackUrl);
    } else {
      setError("Sign in failed. Check the details you provided are correct.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="signin-container">
      <Toaster position="top-right" />
      <form onSubmit={handleLogin} className="signin-form">
        <h2>Sign In</h2>

        {error && <div className="error-banner">{error}</div>}

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          MFA Token (if enabled)
          <input
            type="text"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
          />
        </label>

        <label>
          After login go to:
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{ marginTop: "0.5rem", padding: "0.5rem", width: "100%" }}
          >
            <option value="admin">Admin (Create/Assign Role)</option>
            <option value="uploader">Uploader (Main Site)</option>
          </select>
        </label>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <style jsx>{`
        .signin-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #111;
          color: white;
        }

        .signin-form {
          background: #1c1c1c;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          width: 100%;
          max-width: 400px;
        }

        label {
          display: block;
          margin: 1rem 0 0.5rem;
        }

        input,
        select {
          width: 100%;
          padding: 0.5rem;
          background: #2c2c2c;
          color: white;
          border: 1px solid #444;
          border-radius: 4px;
        }

        .error-banner {
          background: #ff4d4f;
          color: white;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}