import PaginationControls from "./PaginationControls";

export default function PaginationSection({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  return (
    <PaginationControls
      currentPage={currentPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
    />
  );
}