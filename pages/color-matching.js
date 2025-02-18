const [rgb, setRgb] = useState([255, 255, 255]);
const [matchedThread, setMatchedThread] = useState("");

const handleMatch = async () => {
  const response = await fetch("/api/match-thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rgb }),
  });

  const data = await response.json();
  setMatchedThread(data.matchedThreadBrand);
};

<button onClick={handleMatch}>Find Best Thread Match</button>

{matchedThread && <p>Best Thread Match: {matchedThread}</p>}