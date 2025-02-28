import { useState } from "react";

export default function ThreadOptimization({ fileUrl }) {
  const [optimizedCuts, setOptimizedCuts] = useState([]);

  // Fetch optimized thread cuts from the API
  const fetchOptimizedCuts = async () => {
    if (!fileUrl) {
      alert("No file selected for optimization.");
      return;
    }

    try {
      const response = await fetch("/api/optimize-thread-cuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) throw new Error("Failed to optimize thread cuts");

      const data = await response.json();
      setOptimizedCuts(data.optimizedCuts);
    } catch (error) {
      console.error("Error fetching optimized cuts:", error);
      alert("An error occurred while optimizing thread cuts.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Thread Optimization</h2>

      {/* Optimize Button */}
      <button onClick={fetchOptimizedCuts}>Optimize Thread Cuts</button>

      {/* Display Optimized Cuts */}
      <h3>Optimized Thread Cuts:</h3>
      {optimizedCuts.length > 0 ? (
        <ul>
          {optimizedCuts.map((cut, index) => (
            <li key={index}>Trim at: {cut[0]} → {cut[1]}</li>
          ))}
        </ul>
      ) : (
        <p>No optimizations available yet.</p>
      )}
    </div>
  );
}
