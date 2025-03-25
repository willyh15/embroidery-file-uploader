import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Button from "../../components/Button";
import toast, { Toaster } from "react-hot-toast";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destination, setDestination] = useState("/");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("lastDestination");
    if (saved) setDestination(saved);
  }, []);

  const handleDestinationChange = (target) => {
    setDestination(target);
    localStorage.setItem("lastDestination", target);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      mfaToken,
      callbackUrl: destination,
    });

    if (result?.ok) {
      toast.success("Signed in successfully!");
      setTimeout(() => {
        router.push(result.url || destination);
      }, 1000);
    } else {
      setError("Sign in failed. Check your details.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="signin-container">
      <Toaster position="top-right" />
      <form onSubmit={handleLogin} className="signin-form">
        <h2>Sign In</h2>
        {error && <div className="error-banner">{error}</div>}

        <label>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>MFA Token (if enabled)</label>
        <input type="text" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)} />

        <div className="destination-toggle">
          <span>Go to:</span>
          <button type="button" className={destination === "/" ? "active" : ""} onClick={() => handleDestinationChange("/")}>
            Uploader
          </button>
          <button type="button" className={destination === "/admin" ? "active" : ""} onClick={() => handleDestinationChange("/admin")}>
            Admin
          </button>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <style jsx>{`
        .signin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #111;
          color: white;
        }
        .signin-form {
          background: #1c1c1c;
          padding: 2rem;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
        }
        label {
          display: block;
          margin-top: 1rem;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          background: #2c2c2c;
          border: 1px solid #444;
          border-radius: 4px;
          color: white;
        }
        .error-banner {
          background: #ff4d4f;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }
        .destination-toggle {
          display: flex;
          justify-content: space-between;
          margin: 1.5rem 0;
          background: #222;
          padding: 0.5rem;
          border-radius: 6px;
        }
        .destination-toggle button {
          flex: 1;
          margin: 0 0.25rem;
          background: #333;
          border: none;
          color: #ccc;
          padding: 0.5rem;
          border-radius: 4px;
        }
        .destination-toggle button.active {
          background: #0070f3;
          color: white;
        }
      `}</style>
    </div>
  );
}