import { useState, useEffect } from "react";

export default function UnderlaySuggestions() {
  const [fabricType, setFabricType] = useState("cotton");
  const [stitchDensity, setStitchDensity] = useState(0);
  const [suggestedUnderlay, setSuggestedUnderlay] = useState(null);

  const fetchUnderlaySuggestion = async () => {
    const response = await fetch("/api/underlay-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fabricType, stitchDensity }),
    });

    const data = await response.json();
    setSuggestedUnderlay(data.underlay);
  };

  return (
    <div>
      <h1>Underlay Stitch Suggestions</h1>

      <label>Fabric Type:</label>
      <select value={fabricType} onChange={(e) => setFabricType(e.target.value)}>
        <option value="cotton">Cotton</option>
        <option value="polyester">Polyester</option>
        <option value="denim">Denim</option>
        <option value="leather">Leather</option>
      </select>

      <label>Stitch Density:</label>
      <input
        type="number"
        value={stitchDensity}
        onChange={(e) => setStitchDensity(Number(e.target.value))}
      />

      <button onClick={fetchUnderlaySuggestion}>Get Underlay Suggestion</button>

      {suggestedUnderlay && (
        <p>Suggested Underlay: <strong>{suggestedUnderlay}</strong></p>
      )}
    </div>
  );
}