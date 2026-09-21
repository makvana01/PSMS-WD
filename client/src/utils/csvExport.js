/**
 * CSV EXPORT UTILITY (csvExport.js)
 * Converts JavaScript object arrays to formatted CSV files and triggers direct browser download.
 */

export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Determine headers and accessors
  const headerKeys = columns || Object.keys(data[0]);

  // Build CSV Rows
  const csvRows = [];

  // Header Row
  const headers = headerKeys.map((col) => {
    const label = typeof col === 'object' ? col.label : col;
    return `"${String(label).replace(/"/g, '""')}"`;
  });
  csvRows.push(headers.join(','));

  // Data Rows
  for (const row of data) {
    const values = headerKeys.map((col) => {
      const key = typeof col === 'object' ? col.key : col;
      let val = '';

      if (typeof col === 'object' && typeof col.accessor === 'function') {
        val = col.accessor(row);
      } else if (key.includes('.')) {
        // nested property support (e.g. user.name)
        val = key.split('.').reduce((obj, k) => (obj ? obj[k] : ''), row);
      } else {
        val = row[key];
      }

      if (val === null || val === undefined) {
        val = '';
      } else if (Array.isArray(val)) {
        val = val.join('; ');
      } else if (val instanceof Date) {
        val = val.toLocaleDateString();
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      }

      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // Create UTF-8 BOM and Blob for Excel compatibility
  const csvString = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // Create download link and trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
