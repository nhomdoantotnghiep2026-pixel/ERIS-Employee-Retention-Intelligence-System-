export function toCsv(columns, rows) {
  const cell = value => {
    let text = String(value ?? '');
    // Neutralize spreadsheet formulas, including formulas behind whitespace.
    if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [columns, ...rows.map(row => columns.map(c => row[c]))]
    .map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
