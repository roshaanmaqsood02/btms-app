"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
  showResultsInfo?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 5,
  className,
  showResultsInfo = true,
}: TablePaginationProps) {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page if not already included
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {/* Results Info */}
      {showResultsInfo && totalItems > 0 && (
        <div className="text-sm text-gray-500 inline-block">
          Showing{" "}
          <span className="font-semibold text-gray-600">
            {startItem}-{endItem}
          </span>{" "}
          out of{" "}
          <span className="font-semibold text-gray-600">{totalItems}</span>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {visiblePages.map((page, index) => (
              <div key={index}>
                {page === "ellipsis" ? (
                  <span className="px-2 text-gray-400">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className={`h-8 w-8 p-0 min-w-0 ${
                      currentPage === page
                        ? "bg-cyan-300 hover:bg-cyan-400 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Show message when no results */}
      {totalItems === 0 && (
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-md border">
          No results found
        </div>
      )}
    </div>
  );
}
