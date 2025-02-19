const [fabricType, setFabricType] = useState("cotton");
const [stitchDensity, setStitchDensity] = useState(1.2);
const [recommendedTension, setRecommendedTension] = useState(null);

const fetchTensionRecommendation = async () => {
  const response = await fetch("/api/recommend-thread-tension", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fabricType, stitchDensity }),
  });

  const data = await response.json();
  setRecommendedTension(data.recommendedTension);
};

<button onClick={fetchTensionRecommendation}>Get Tension Recommendation</button>

{recommendedTension && <p>Recommended Tension: {recommendedTension}</p>}