import type { ColumnDef, RowData, Sheet } from '../types/sheet';
import { createId } from './id';

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export function sheetToCsv(sheet: Sheet): string {
  const header = sheet.columns.map((c) => escapeCsvField(c.name)).join(',');
  const rows = sheet.rows.map((row) =>
    sheet.columns.map((_, i) => escapeCsvField(row.cells[i]?.value ?? '')).join(',')
  );
  return [header, ...rows].join('\n');
}

export function csvToSheet(csvText: string, sheetName: string): Sheet {
  const lines = csvText.split(/\r\n|\n/).filter((l) => l.length > 0);
  const headerFields = lines.length > 0 ? parseCsvLine(lines[0]) : ['Name'];

  const columns: ColumnDef[] = headerFields.map((name, i) => ({
    id: createId(),
    name: name || `Column ${String.fromCharCode(65 + i)}`,
  }));

  const rows: RowData[] = lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    return {
      id: createId(),
      cells: columns.map((_, i) => ({ value: fields[i] ?? '' })),
    };
  });

  const now = Date.now();
  return {
    id: createId(),
    name: sheetName,
    columns,
    rows,
    createdAt: now,
    updatedAt: now,
  };
}

export function sheetToJson(sheet: Sheet): string {
  return JSON.stringify(sheet, null, 2);
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
