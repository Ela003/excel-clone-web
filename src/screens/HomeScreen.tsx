import { useMemo, useRef, useState } from 'react';
import type { Sheet } from '../types/sheet';
import { csvToSheet } from '../lib/csv';
import { createEmptySheet } from '../lib/sheetEngine';

interface Props {
  sheets: Sheet[];
  onOpen: (id: string) => void;
  onCreate: (sheet: Sheet) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ sheets, onOpen, onCreate, onDelete, onOpenSettings }: Props) {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sheets;
    return sheets.filter((s) => s.name.toLowerCase().includes(q));
  }, [sheets, search]);

  const handleCreate = () => {
    const name = `Sheet ${sheets.length + 1}`;
    onCreate(createEmptySheet(name, ['Seiko', 'Casio', 'Titan']));
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-8" style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}>
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-semibold">Voice Sheet</h1>
        <button
          onClick={onOpenSettings}
          className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Settings"
        >
          ⚙
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Search sheets"
        className="mb-3 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div className="mb-4 flex gap-2">
        <button
          onClick={handleCreate}
          className="flex-1 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white active:scale-[0.98]"
        >
          + New sheet
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
        >
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onCreate(csvToSheet(String(reader.result), file.name.replace(/\.csv$/i, '')));
            reader.readAsText(file);
            e.target.value = '';
          }}
        />
      </div>

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Recent sheets</p>

      <div className="flex flex-col gap-2">
        {filtered.map((sheet) => (
          <div
            key={sheet.id}
            className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <button onClick={() => onOpen(sheet.id)} className="flex-1 text-left">
              <p className="font-medium">{sheet.name}</p>
              <p className="text-xs text-neutral-400">
                {sheet.rows.length} rows · updated {new Date(sheet.updatedAt).toLocaleDateString()}
              </p>
            </button>
            <button
              onClick={() => onDelete(sheet.id)}
              className="rounded px-2 py-1 text-xs text-neutral-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40"
            >
              Delete
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">No sheets yet. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
