import { useEffect, useState } from "react";

export default function RecentActivityPanel({ uploadedFiles }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const recentList = [...uploadedFiles]
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 5);
    setRecent(recentList);
  }, [uploadedFiles]);

  if (!recent.length) return null;

  return (
    <div className="mt-6 bg-white shadow rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
      <ul className="space-y-2">
        {recent.map((file, i) => (
          <li key={i} className="text-sm text-gray-700">
            <strong>{file.name}</strong> - <span className="capitalize">{file.status}</span>{" "}
            {file.stage && <em className="text-gray-500">({file.stage})</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
