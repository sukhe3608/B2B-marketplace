/* ============================================================
   TradeLink — CSV Utility Helper
   Client-side CSV parsing and serialization with support for
   PapaParse if installed, and robust native regex/split fallback.
   ============================================================ */

/**
 * Parses CSV text into array of object rows
 */
export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  // Split lines
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header
  const headers = splitCSVRow(lines[0]);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVRow(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Robust CSV row tokenizer handling quoted strings and commas
 */
function splitCSVRow(rowStr) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === '"') {
      if (inQuotes && rowStr[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Serializes an array of objects into CSV string
 */
export function unparseCSV(data = [], columns = null) {
  if (!data || data.length === 0) return '';

  const headers = columns || Object.keys(data[0]);

  const csvRows = [];
  // Header row
  csvRows.push(headers.map(escapeCSVValue).join(','));

  // Data rows
  data.forEach((item) => {
    const row = headers.map((header) => {
      const val = item[header] !== undefined && item[header] !== null ? item[header] : '';
      return escapeCSVValue(String(val));
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\r\n');
}

function escapeCSVValue(val) {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Triggers a browser download of a CSV file
 */
export function downloadCSV(csvContent, filename = 'export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

