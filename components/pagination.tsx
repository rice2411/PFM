"use client";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
}

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  hasNextPage = false,
}: PaginationProps) {
  // Nếu có hasNextPage, tính totalPages dựa trên currentPage + 1
  // Nếu không, tính dựa trên totalItems
  const totalPages = hasNextPage
    ? currentPage + 1
    : Math.ceil(totalItems / itemsPerPage);

  // Không hiển thị nếu chỉ có 1 trang hoặc không có items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  // Tính toán các trang cần hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu ít hơn maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị với ellipsis
      if (currentPage <= 3) {
        // Hiển thị 1, 2, 3, 4, ..., last
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Hiển thị 1, ..., last-3, last-2, last-1, last
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Hiển thị 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasNextPage || currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    page: number | string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof page === "number") {
      onPageChange(page);
    }
  };

  return (
    <nav
      aria-label="Page navigation"
      className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            đến{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            trong tổng số <span className="font-medium">{totalItems}</span> giao
            dịch
          </p>
        </div>
        <div>
          <ul className="flex -space-x-px text-sm">
            {/* Previous Button */}
            <li>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`rounded-l-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 transition-colors ${
                  currentPage === 1
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
                    : "bg-white hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <li key={`ellipsis-${index}`}>
                    <span className="border border-gray-300 bg-white px-3 pt-0 pb-4.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      ...
                    </span>
                  </li>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <li key={pageNum}>
                  <button
                    type="button"
                    onClick={(e) => handlePageClick(e, pageNum)}
                    aria-current={isActive ? "page" : undefined}
                    className={`border border-gray-300 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "z-10 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-900/50 dark:text-blue-400"
                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}

            {/* Next Button */}
            <li>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNextPage && currentPage >= totalPages}
                className={`rounded-r-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 transition-colors ${
                  currentPage === totalPages
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
                    : "bg-white hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile view */}
      <div className="flex flex-1 items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Previous
        </button>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Trang <span className="font-medium">{currentPage}</span> /{" "}
          <span className="font-medium">{totalPages}</span>
        </p>
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNextPage && currentPage >= totalPages}
          className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
