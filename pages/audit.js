const [logs, setLogs] = useState([]);

useEffect(() => {
  const fetchLogs = async () => {
    const response = await fetch("/api/get-audit-logs");
    const data = await response.json();
    setLogs(data.logs);
  };

  fetchLogs();
}, []);

<ul>
  {logs.map((log, index) => (
    <li key={index}>{log}</li>
  ))}
</ul>
