import { useState, useEffect } from "react";

export default function ThreadTension() {
  const [fabricType, setFabricType] = useState("cotton");
  const [stitchSpeed, setStitchSpeed] = useState(600);
  const [suggestedTension, setSuggestedTension] = useState(null);

  const fetchThreadTension = async () => {
    const response = await fetch("/api/thread-tension", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fabricType, stitchSpeed }),
    });

    const data = await response.json();
    setSuggestedTension(data.tension);
  };

  return (
    <div>
      <h1>Thread Tension Recommendations</h1>

      <label>Fabric Type:</label>
      <select value={fabricType} onChange={(e) => setFabricType(e.target.value)}>
        <option value="cotton">Cotton</option>
        <option value="polyester">Polyester</option>
        <option value="denim">Denim</option>
        <option value="leather">Leather</option>
      </select>

      <label>Stitch Speed (SPM):</label>
      <input
        type="number"
        value={stitchSpeed}
        onChange={(e) => setStitchSpeed(Number(e.target.value))}
      />

      <button onClick={fetchThreadTension}>Get Thread Tension</button>

      {suggestedTension && (
        <p>Recommended Tension: <strong>{suggestedTension}</strong></p>
      )}
    </div>
  );
}