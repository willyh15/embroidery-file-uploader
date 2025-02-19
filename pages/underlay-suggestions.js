const [underlaySuggestion, setUnderlaySuggestion] = useState("");

const handleUnderlaySuggestion = async (fabricType, density) => {
  const response = await fetch("/api/recommend-underlay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fabricType, density }),
  });

  const data = await response.json();
  setUnderlaySuggestion(data.underlaySuggestion);
};

<button onClick={() => handleUnderlaySuggestion("cotton", 1.2)}>Get Underlay Suggestion</button>

{underlaySuggestion && <p>Suggested Underlay: {underlaySuggestion}</p>}