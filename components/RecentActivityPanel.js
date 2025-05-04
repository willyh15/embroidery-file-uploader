// components/RecentActivityPanel.js
export default function RecentActivityPanel({ uploadedFiles }) {
  if (!uploadedFiles || !uploadedFiles.length) return null;

  const recent = [...uploadedFiles]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-screen-lg bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Recent Activity
      </h3>
      <ul className="space-y-3">
        {recent.map((f) => (
          <li
            key={f.url}
            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <span className="truncate max-w-xs text-gray-800 dark:text-gray-100">
              {f.name}
            </span>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${f.status === "Converted"
                  ? "bg-green-100 text-green-700"
                  : f.status === "Uploaded"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"}
              `}
            >
              {f.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}