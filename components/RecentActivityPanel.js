// components/RecentActivityPanel.js
export default function RecentActivityPanel({ uploadedFiles }) {
  if (!uploadedFiles || uploadedFiles.length === 0) return null;

  const recent = [...uploadedFiles]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);

  const badgeClasses = (status) => {
    switch (status) {
      case "Converted":
        return "bg-green-500 text-white";
      case "Uploaded":
        return "bg-blue-500 text-white";
      case "Converting":
        return "bg-yellow-500 text-white";
      case "Error":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="glass-modal p-6 mt-8">
      <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {recent.map((f) => (
          <li
            key={f.url}
            className="flex justify-between items-center p-4 bg-[var(--secondary-bg)] rounded-lg"
          >
            <span className="truncate max-w-xs text-[var(--primary-text)]">
              {f.name}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses(
                f.status
              )}`}
            >
              {f.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}