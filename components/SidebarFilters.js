// components/SidebarFilters.js
export default function SidebarFilters({ filters, onFilterChange }) {
  const handle = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass-modal p-6 mb-6">
      <h3 className="text-2xl font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="mb-2">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handle}
            className="p-3 bg-[var(--secondary-bg)] text-[var(--primary-text)] rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">All</option>
            <option>Uploaded</option>
            <option>Converting</option>
            <option>Converted</option>
            <option>Error</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex flex-col">
          <label className="mb-2">File Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handle}
            className="p-3 bg-[var(--secondary-bg)] text-[var(--primary-text)] rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">All Types</option>
            <option value=".png">PNG</option>
            <option value=".jpg">JPG</option>
            <option value=".svg">SVG</option>
            <option value=".pes">PES</option>
          </select>
        </div>

        {/* Search Filter */}
        <div className="flex flex-col">
          <label className="mb-2">Search</label>
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handle}
            placeholder="Name…"
            className="p-3 bg-[var(--secondary-bg)] text-[var(--primary-text)] placeholder-[color:var(--primary-text)] rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );
}