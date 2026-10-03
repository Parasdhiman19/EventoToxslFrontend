import { useState, useMemo, useEffect } from 'react'

/**
 * Reusable pagination hook.
 * @param {Array} data - The array of items to paginate (typically post-filtered).
 * @param {Object} options
 * @param {number} [options.initialPageSize=15] - Initial items per page.
 * @param {Array} [options.resetDeps=[]] - Array of dependencies that reset pagination to page 1 on change (e.g. [search, filter]).
 * @returns {Object} Pagination state and controls.
 */
export function usePagination(data = [], { initialPageSize = 15, resetDeps = [] } = {}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Reset to page 1 whenever filter/search dependencies change
  useEffect(() => {
    setCurrentPage(1)
  }, resetDeps)

  const safeData = Array.isArray(data) ? data : []
  const totalItems = safeData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Ensure current page is within valid range if totalItems shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const paginatedData = useMemo(() => {
    return safeData.slice(startIndex, endIndex)
  }, [safeData, startIndex, endIndex])

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(Number(page) || 1, totalPages))
    setCurrentPage(p)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handlePageSizeChange = (newSize) => {
    const size = Number(newSize) || initialPageSize
    setPageSize(size)
    setCurrentPage(1)
  }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handlePageSizeChange,
  }
}

export default usePagination
