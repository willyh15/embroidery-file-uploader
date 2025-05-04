// components/SidebarFilters.js
export default function SidebarFilters({ filters, onFilterChange }) {
  const handle = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mb-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-white">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handle}
            className="w-full p-2 rounded-lg bg-white text-gray-800"
          >
            <option value="">All</option>
            <option>Uploaded</option>
            <option>Converting</option>
            <option>Converted</option>
            <option>Error</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-white">File Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handle}
            className="w-full p-2 rounded-lg bg-white text-gray-800"
          >
            <option value="">All Types</option>
            <option value=".png">PNG</option>
            <option value=".jpg">JPG</option>
            <option value=".svg">SVG</option>
            <option value=".pes">PES</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-white">Search</label>
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handle}
            placeholder="Name…"
            className="w-full p-2 rounded-lg bg-white text-gray-800"
          />
        </div>
      </div>
    </div>
  );
}