import { useState, useEffect } from "react";

export default function ColorMatching() {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [matchingThreads, setMatchingThreads] = useState([]);

  useEffect(() => {
    const fetchMatchingThreads = async () => {
      try {
        const response = await fetch(`/api/get-thread-matches?color=${selectedColor}`);
        const data = await response.json();
        setMatchingThreads(data.threads);
      } catch (error) {
        console.error("Error fetching thread matches:", error);
      }
    };

    if (selectedColor) fetchMatchingThreads();
  }, [selectedColor]);

  return (
    <div>
      <h1>Color Matching</h1>
      <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
      <ul>
        {matchingThreads.map((thread, index) => (
          <li key={index}>{thread.brand} - {thread.code} ({thread.name})</li>
        ))}
      </ul>
    </div>
  );
}