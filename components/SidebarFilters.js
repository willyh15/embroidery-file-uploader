import { useState, useEffect } from "react";

export default function SidebarFilters({ filters, onFilterChange }) {
  const [status, setStatus] = useState(filters.status || "");
  const [type, setType] = useState(filters.type || "");
  const [query, setQuery] = useState(filters.query || "");

  useEffect(() => {
    onFilterChange({ status, type, query });
  }, [status, type, query]);

  return (
    <div className="w-full p-4 space-y-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full p-2 border rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="w-full p-2 border rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Uploaded">Uploaded</option>
          <option value="Converting">Converting</option>
          <option value="Converted">Converted</option>
          <option value="Error">Error</option>
        </select>
        <select
          className="w-full p-2 border rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="svg">SVG</option>
          <option value="pes">PES</option>
        </select>
      </div>
    </div>
  );
}
