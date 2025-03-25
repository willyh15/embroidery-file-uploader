import { SearchIcon } from "./Icons";

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div
      className="search-bar"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <SearchIcon />
      <input
        className="search-input"
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}