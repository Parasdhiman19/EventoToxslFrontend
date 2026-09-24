/**
 * Generates and triggers a browser download for a CSV file.
 * @param {string[]} headers - Array of column header titles
 * @param {Array<Array<string|number>>} rows - Array of row data
 * @param {string} filenamePrefix - Prefix for the downloaded file (e.g. 'evento_sales')
 */
export function exportToCsv(headers, rows, filenamePrefix = 'evento_export') {
  if (!rows || rows.length === 0) {
    return false
  }

  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '""'
          const str = String(cell)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return `"${str}"`
        })
        .join(',')
    ),
  ]

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  const dateStr = new Date().toISOString().slice(0, 10)
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return true
}
