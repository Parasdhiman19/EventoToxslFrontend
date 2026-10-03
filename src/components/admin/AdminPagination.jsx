import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

/**
 * Reusable AdminPagination Component for Super Admin Tables.
 */
export function AdminPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  pageSize = 15,
  pageSizeOptions = [10, 15, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records',
}) {
  if (totalItems === 0) return null

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        end = 4
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3
      }

      if (start > 2) {
        pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="px-4 py-3 border-t border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
      {/* Left side: Range counter & Page size */}
      <div className="flex flex-wrap items-center gap-3 text-stone-500">
        <span>
          Showing <strong className="text-stone-900 font-semibold">{startIndex}</strong> to{' '}
          <strong className="text-stone-900 font-semibold">{endIndex}</strong> of{' '}
          <strong className="text-stone-900 font-semibold">{totalItems}</strong> {itemLabel}
        </span>

        {pageSizeOptions && pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
            <span className="text-[11px] text-stone-400">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded px-1.5 py-0.5 text-[11px] text-stone-800 focus:outline-none focus:border-stone-800 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation buttons & Page pills */}
      <div className="flex items-center gap-1 self-end sm:self-auto">
        {/* First page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className="p-1 rounded hover:bg-stone-200/60 disabled:opacity-30 disabled:hover:bg-transparent text-stone-600 transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="p-1 rounded hover:bg-stone-200/60 disabled:opacity-30 disabled:hover:bg-transparent text-stone-600 transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-stone-400 text-xs">
                  ...
                </span>
              )
            }
            const isActive = page === currentPage
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[24px] h-6 px-1.5 rounded text-[11px] font-mono transition cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="p-1 rounded hover:bg-stone-200/60 disabled:opacity-30 disabled:hover:bg-transparent text-stone-600 transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last page button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          className="p-1 rounded hover:bg-stone-200/60 disabled:opacity-30 disabled:hover:bg-transparent text-stone-600 transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default AdminPagination
