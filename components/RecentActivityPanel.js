// components/RecentActivityPanel.js
export default function RecentActivityPanel({ uploadedFiles }) {
  const recent = uploadedFiles
    .slice(-5)
    .reverse()
    .map((file) => ({ name: file.name, status: file.status, timestamp: new Date().toLocaleString() }));

  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
      <ul className="text-sm text-gray-700 space-y-1">
        {recent.map((file, idx) => (
          <li key={idx} className="flex justify-between">
            <span className="truncate max-w-[60%]">{file.name}</span>
            <span className="text-xs text-gray-500 italic">{file.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
