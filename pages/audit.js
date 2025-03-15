import { useState, useEffect } from "react";

export default function AuditPage() {
  const [auditData, setAuditData] = useState([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch("/api/get-audit-logs");
        const data = await response.json();
        setAuditData(data.logs);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div>
      <h1>Audit Logs</h1>
      <ul>
        {auditData.map((log, index) => (
          <li key={index}>{log.action} - {new Date(log.timestamp).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}