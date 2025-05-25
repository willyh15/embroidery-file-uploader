// components/PaginationControls.js
import { useEffect } from "react";

export default function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages < 2) return null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="container flex justify-center items-center space-x-4 my-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          btn btn-secondary
          ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        Previous
      </button>
      <span className="text-[var(--primary-text)]">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          btn btn-secondary
          ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        Next
      </button>
    </div>
  );
}