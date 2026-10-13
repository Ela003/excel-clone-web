import { useState } from 'react';
import type { Sheet } from '../types/sheet';

interface Props {
  sheet: Sheet;
  highlightRowId?: string | null;
  onCellChange: (rowId: string, columnIndex: number, value: string) => void;
  onDeleteRow: (rowId: string) => void;
  onRenameColumn: (columnIndex: number, name: string) => void;
  onDeleteColumn: (columnIndex: number) => void;
  onSort: (columnIndex: number) => void;
}

export function SpreadsheetGrid({
  sheet,
  highlightRowId,
  onCellChange,
  onDeleteRow,
  onRenameColumn,
  onDeleteColumn,
  onSort,
}: Props) {
  const [editingHeader, setEditingHeader] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            {sheet.columns.map((col, i) => (
              <th
                key={col.id}
                className={`sticky top-0 z-10 border-b border-r border-neutral-200 bg-neutral-50 px-3 py-2 text-left font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 ${
                  i === 0 ? 'left-0 z-20 min-w-[120px]' : 'min-w-[90px]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  {editingHeader === i ? (
                    <input
                      autoFocus
                      defaultValue={col.name}
                      onBlur={(e) => {
                        onRenameColumn(i, e.target.value || col.name);
                        setEditingHeader(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                        if (e.key === 'Escape') setEditingHeader(null);
                      }}
                      className="w-full min-w-0 rounded border border-neutral-300 bg-white px-1 py-0.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                    />
                  ) : (
                    <button
                      className="truncate text-left"
                      onClick={() => setEditingHeader(i)}
                      title="Click to rename"
                    >
                      {col.name}
                    </button>
                  )}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      className="rounded px-1 text-xs text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700"
                      onClick={() => onSort(i)}
                      title="Sort by this column"
                    >
                      ↕
                    </button>
                    {i > 0 && (
                      <button
                        className="rounded px-1 text-xs text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40"
                        onClick={() => onDeleteColumn(i)}
                        title="Delete column"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </th>
            ))}
            <th className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50 px-2 py-2 dark:border-neutral-700 dark:bg-neutral-900" />
          </tr>
        </thead>
        <tbody>
          {sheet.rows.map((row) => (
            <tr
              key={row.id}
              className={`group ${
                highlightRowId === row.id ? 'bg-purple-50 dark:bg-purple-950/40' : ''
              }`}
            >
              {sheet.columns.map((col, i) => (
                <td
                  key={col.id}
                  className={`border-b border-r border-neutral-200 p-0 dark:border-neutral-800 ${
                    i === 0 ? 'sticky left-0 z-[5] bg-white font-medium dark:bg-neutral-950' : 'bg-white dark:bg-neutral-950'
                  } ${highlightRowId === row.id ? '!bg-purple-50 dark:!bg-purple-950/40' : ''}`}
                >
                  <input
                    value={row.cells[i]?.value ?? ''}
                    onChange={(e) => onCellChange(row.id, i, e.target.value)}
                    className="w-full min-w-[90px] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400"
                    inputMode={i === 0 ? 'text' : 'decimal'}
                  />
                </td>
              ))}
              <td className="border-b border-neutral-200 px-1 dark:border-neutral-800">
                <button
                  className="rounded px-2 py-1 text-xs text-neutral-300 opacity-0 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/40"
                  onClick={() => onDeleteRow(row.id)}
                  title="Delete row"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
          {sheet.rows.length === 0 && (
            <tr>
              <td colSpan={sheet.columns.length + 1} className="px-3 py-8 text-center text-neutral-400">
                No rows yet. Add a row or say a name to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
