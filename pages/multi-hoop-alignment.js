import { useState, useEffect } from "react";

export default function MultiHoopAlignment() {
  const [alignmentData, setAlignmentData] = useState([]);
  const [hoopSize, setHoopSize] = useState(null);

  useEffect(() => {
    const fetchAlignmentData = async () => {
      const response = await fetch("/api/get-hoop-alignment");
      const data = await response.json();
      setAlignmentData(data.alignment);
    };

    fetchAlignmentData();
  }, []);

  return (
    <div>
      <h1>Multi-Hoop Alignment</h1>
      <ul>
        {alignmentData.map((align, index) => (
          <li key={index}>{align}</li>
        ))}
      </ul>
    </div>
  );
}