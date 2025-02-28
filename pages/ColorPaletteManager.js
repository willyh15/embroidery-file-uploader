import { useState, useEffect } from "react";

export default function ColorPaletteManager() {
  const [paletteName, setPaletteName] = useState("");
  const [colors, setColors] = useState([]);
  const [palettes, setPalettes] = useState([]);

  // Fetch saved palettes on component mount
  useEffect(() => {
    const fetchPalettes = async () => {
      try {
        const response = await fetch("/api/get-color-palettes");
        if (!response.ok) throw new Error("Failed to fetch palettes");
        const data = await response.json();
        setPalettes(data.palettes);
      } catch (error) {
        console.error("Error fetching palettes:", error);
      }
    };

    fetchPalettes();
  }, []);

  // Save new color palette
  const savePalette = async () => {
    if (!paletteName.trim() || colors.length === 0) {
      alert("Please enter a palette name and select at least one color.");
      return;
    }

    try {
      const response = await fetch("/api/save-color-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paletteName, colors }),
      });

      if (!response.ok) throw new Error("Failed to save palette");

      alert(`Palette "${paletteName}" saved!`);
      setPalettes([...palettes, { name: paletteName, colors }]);
      setPaletteName("");
      setColors([]);
    } catch (error) {
      console.error("Error saving palette:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Color Palette Manager</h2>

      {/* Palette Name Input */}
      <input
        type="text"
        placeholder="Palette Name"
        value={paletteName}
        onChange={(e) => setPaletteName(e.target.value)}
      />

      {/* Color Picker */}
      <input
        type="color"
        onChange={(e) => setColors([...colors, e.target.value])}
      />

      {/* Save Palette Button */}
      <button onClick={savePalette}>Save Palette</button>

      {/* Display Selected Colors */}
      <h3>Selected Colors:</h3>
      <ul>
        {colors.map((color, index) => (
          <li key={index} style={{ background: color, padding: "5px", margin: "5px", color: "#fff" }}>
            {color}
          </li>
        ))}
      </ul>

      {/* Display Saved Palettes */}
      <h3>Saved Palettes:</h3>
      <ul>
        {palettes.length > 0 ? (
          palettes.map((palette, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <strong>{palette.name}</strong>
              <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      background: color,
                      width: "30px",
                      height: "30px",
                      borderRadius: "5px",
                    }}
                  />
                ))}
              </div>
            </li>
          ))
        ) : (
          <p>No palettes saved yet.</p>
        )}
      </ul>
    </div>
  );
}
