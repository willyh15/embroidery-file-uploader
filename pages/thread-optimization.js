const [optimizedCuts, setOptimizedCuts] = useState([]);

const fetchOptimizedCuts = async (fileUrl) => {
  const response = await fetch("/api/optimize-thread-cuts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });

  const data = await response.json();
  setOptimizedCuts(data.optimizedCuts);
};

<button onClick={() => fetchOptimizedCuts(fileUrl)}>Optimize Thread Cuts</button>

<ul>
  {optimizedCuts.map((cut, index) => (
    <li key={index}>Trim at: {cut[0]} → {cut[1]}</li>
  ))}
</ul>