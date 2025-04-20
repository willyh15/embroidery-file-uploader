export default function SidebarFilters({ filters, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm mb-2">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">All</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Converting">Converting</option>
            <option value="Converted">Converted</option>
            <option value="Error">Error</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-2">File Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">All Types</option>
            <option value=".png">PNG</option>
            <option value=".jpg">JPG</option>
            <option value=".svg">SVG</option>
            <option value=".pes">PES</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-2">Search</label>
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handleChange}
            placeholder="Search by name..."
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      </div>
    </div>
  );
}