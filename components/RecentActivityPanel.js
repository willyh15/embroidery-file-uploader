export default function RecentActivityPanel({ uploadedFiles }) {
  if (!uploadedFiles || uploadedFiles.length === 0) return null;

  const sortedRecent = [...uploadedFiles]
    .filter(f => f && f.name)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h3>
      <ul className="space-y-3">
        {sortedRecent.map((file) => (
          <li
            key={file.url}
            className="flex justify-between items-center p-3 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all border border-gray-200"
          >
            <div className="text-sm font-medium text-gray-800 truncate max-w-[70%]">
              {file.name}
            </div>
            <div className="text-xs text-gray-600">
              {file.status === "Converted" && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Converted</span>
              )}
              {file.status === "Uploaded" && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Uploaded</span>
              )}
              {file.status === "Error" && (
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Error</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}