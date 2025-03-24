// pages/test-session.js
import { useEffect, useState } from "react";

export default function TestSession() {
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(`Status ${res.status}: ${data?.message || "Unknown error"}`);
        }

        setSessionData(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchSession();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>/api/auth/session Test</h2>
      {error && (
        <pre style={{ color: "red" }}>Error: {error}</pre>
      )}
      {sessionData ? (
        <pre>{JSON.stringify(sessionData, null, 2)}</pre>
      ) : (
        <p>Loading session...</p>
      )}
    </div>
  );
}