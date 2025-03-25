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
  const [destination, setDestination] = useState("/"); // uploader by default
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
      }, 1000); // Optional: delay for toast to show
    } else {
      setError("Sign in failed. Check the details you provided.");
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

        <div className="destination-toggle">
          <span>Go to:</span>
          <button
            type="button"
            className={destination === "/" ? "active" : ""}
            onClick={() => handleDestinationChange("/")}
          >
            Uploader
          </button>
          <button
            type="button"
            className={destination === "/admin" ? "active" : ""}
            onClick={() => handleDestinationChange("/admin")}
          >
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

        input {
          width: 100%;
          padding: 0.5rem;
          background: #2c2c2c;
          color: white;
          border: 1px solid #444;
          border-radius: 4px;
        }

        .destination-toggle {
          margin: 1.5rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #222;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .destination-toggle button {
          flex: 1;
          margin: 0 0.25rem;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          background: #333;
          color: #ccc;
          cursor: pointer;
        }

        .destination-toggle button.active {
          background: #0070f3;
          color: white;
          font-weight: bold;
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