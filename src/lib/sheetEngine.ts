import type { ColumnDef, RowData, Sheet } from '../types/sheet';
import { createId } from './id';

const DEFAULT_COLUMN_NAMES = ['Name', 'Column A', 'Column B', 'Column C', 'Column D'];

export function createEmptySheet(name: string, rowNames: string[] = []): Sheet {
  const columns: ColumnDef[] = DEFAULT_COLUMN_NAMES.map((n) => ({ id: createId(), name: n }));
  const rows: RowData[] = rowNames.map((rowName) => ({
    id: createId(),
    cells: columns.map((_, i) => ({ value: i === 0 ? rowName : '' })),
  }));
  const now = Date.now();
  return { id: createId(), name, columns, rows, createdAt: now, updatedAt: now };
}

/** Writes values into a row's cells starting at column index 1 (column 0 is the name). */
export function applyValuesToRow(sheet: Sheet, rowId: string, values: number[]): Sheet {
  const rows = sheet.rows.map((row) => {
    if (row.id !== rowId) return row;

    const cells = [...row.cells];
    while (cells.length < sheet.columns.length) {
      cells.push({ value: '' });
    }

    values.forEach((value, i) => {
      const columnIndex = i + 1; // skip the name column
      if (columnIndex < sheet.columns.length) {
        cells[columnIndex] = { value: String(value) };
      }
    });

    return { ...row, cells };
  });

  return { ...sheet, rows, updatedAt: Date.now() };
}

export function addRow(sheet: Sheet, name = ''): Sheet {
  const newRow: RowData = {
    id: createId(),
    cells: sheet.columns.map((_, i) => ({ value: i === 0 ? name : '' })),
  };
  return { ...sheet, rows: [...sheet.rows, newRow], updatedAt: Date.now() };
}

export function addColumn(sheet: Sheet, name?: string): Sheet {
  const columnLetter = String.fromCharCode(65 + sheet.columns.length - 1);
  const column: ColumnDef = { id: createId(), name: name || `Column ${columnLetter}` };
  return {
    ...sheet,
    columns: [...sheet.columns, column],
    rows: sheet.rows.map((row) => ({ ...row, cells: [...row.cells, { value: '' }] })),
    updatedAt: Date.now(),
  };
}

export function deleteRow(sheet: Sheet, rowId: string): Sheet {
  return { ...sheet, rows: sheet.rows.filter((r) => r.id !== rowId), updatedAt: Date.now() };
}

export function deleteColumn(sheet: Sheet, columnIndex: number): Sheet {
  if (columnIndex === 0) return sheet; // never delete the name column
  return {
    ...sheet,
    columns: sheet.columns.filter((_, i) => i !== columnIndex),
    rows: sheet.rows.map((row) => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== columnIndex),
    })),
    updatedAt: Date.now(),
  };
}

export function renameColumn(sheet: Sheet, columnIndex: number, name: string): Sheet {
  return {
    ...sheet,
    columns: sheet.columns.map((c, i) => (i === columnIndex ? { ...c, name } : c)),
    updatedAt: Date.now(),
  };
}

export function setCellValue(sheet: Sheet, rowId: string, columnIndex: number, value: string): Sheet {
  return {
    ...sheet,
    rows: sheet.rows.map((row) => {
      if (row.id !== rowId) return row;
      const cells = [...row.cells];
      while (cells.length <= columnIndex) cells.push({ value: '' });
      cells[columnIndex] = { value };
      return { ...row, cells };
    }),
    updatedAt: Date.now(),
  };
}

export function renameSheet(sheet: Sheet, name: string): Sheet {
  return { ...sheet, name, updatedAt: Date.now() };
}

export function sortByColumn(sheet: Sheet, columnIndex: number, direction: 'asc' | 'desc'): Sheet {
  const rows = [...sheet.rows].sort((a, b) => {
    const aVal = a.cells[columnIndex]?.value ?? '';
    const bVal = b.cells[columnIndex]?.value ?? '';
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    const bothNumeric = aVal !== '' && bVal !== '' && !Number.isNaN(aNum) && !Number.isNaN(bNum);
    const cmp = bothNumeric ? aNum - bNum : aVal.localeCompare(bVal);
    return direction === 'asc' ? cmp : -cmp;
  });
  return { ...sheet, rows, updatedAt: Date.now() };
}
