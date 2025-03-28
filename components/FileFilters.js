// components/FileFilters.js
import React from "react";

export default function FileFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}) {
  return (
    <div className="filters-container">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="input"
      >
        <option value="">All Statuses</option>
        <option value="Uploaded">Uploaded</option>
        <option value="Auto-stitched">Auto-stitched</option>
        <option value="Converted">Converted</option>
        <option value="Error">Error</option>
      </select>

      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="input"
      >
        <option value="">All Types</option>
        <option value=".png">PNG</option>
        <option value=".jpg">JPG</option>
        <option value=".jpeg">JPEG</option>
        <option value=".webp">WEBP</option>
        <option value=".pes">PES</option>
        <option value=".dst">DST</option>
        {/* NEW: Add SVG filter */}
        <option value=".svg">SVG</option>
      </select>
    </div>
  );
}