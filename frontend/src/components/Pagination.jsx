/*
  ! Pagination
  --------------------------------------------------
  ? Handles page navigation for lists, grids, and data views
  ? Supports previous/next navigation and manual page input

  * Props:
  * - currentPage (number): current active page
  * - totalPages (number): total number of pages available
  * - onPageChange (function): updates the current page state
*/

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="page-opts">
      {
        // ! Previous Page Button
        // * Navigates to the previous page (if not on page 1)
      }
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <span className="icon2">◄</span>
        <span>Prev</span>
      </button>

      {
        // ! Page Indicator (Editable Input)
        // ? Displays current page and total pages
        // * Allows manual page input via contentEditable span
      }
      <div className="pagination">
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            let page = Number(e.target.textContent);

            // ! Validate page input
            if (isNaN(page)) page = currentPage;
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            // * Update page
            onPageChange(page);

            // * Sync UI text
            e.target.textContent = page;
          }}
          onKeyDown={(e) => {
            // * Submit on Enter key
            if (e.key === "Enter") {
              e.preventDefault();
              e.target.blur();
            }
          }}
          className="page-number"
        >
          {currentPage}
        </span>

        <span>/</span>

        <span>{totalPages}</span>
      </div>

      {
        // ! Next Page Button
        // * Navigates to the next page (if not on last page)
      }
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span>Next</span>
        <span className="icon2">►</span>
      </button>
    </div>
  );
}
