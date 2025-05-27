import { useState, useEffect } from "react";
import SidebarFilters from "./SidebarFilters";

export default function FiltersSection({ filters: initialFilters, onFilterChange }) {
  const [filters, setFilters] = useState(initialFilters);

  // Keep local filters state synced with props if changed externally
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (updates) => {
    const updatedFilters = { ...filters, ...updates };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <SidebarFilters filters={filters} onFilterChange={handleChange} />
  );
}