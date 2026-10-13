import { useRef, useState } from 'react';

interface Props {
  sheetName: string;
  search: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onRenameSheet: (name: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onImportCsv: (file: File) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export function Toolbar({
  sheetName,
  search,
  onSearchChange,
  onBack,
  onRenameSheet,
  onAddRow,
  onAddColumn,
  onImportCsv,
  onExportCsv,
  onExportJson,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="flex items-center gap-2 px-3 py-2" style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}>
        <button onClick={onBack} className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          ←
        </button>
        {editingName ? (
          <input
            autoFocus
            defaultValue={sheetName}
            onBlur={(e) => {
              onRenameSheet(e.target.value || sheetName);
              setEditingName(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm font-semibold dark:border-neutral-600 dark:bg-neutral-800"
          />
        ) : (
          <button onClick={() => setEditingName(true)} className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
            {sheetName}
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-neutral-200 bg-white py-1 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                <MenuItem label="Add row" onClick={() => { onAddRow(); setMenuOpen(false); }} />
                <MenuItem label="Add column" onClick={() => { onAddColumn(); setMenuOpen(false); }} />
                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                <MenuItem label="Import CSV" onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }} />
                <MenuItem label="Export CSV" onClick={() => { onExportCsv(); setMenuOpen(false); }} />
                <MenuItem label="Export JSON" onClick={() => { onExportJson(); setMenuOpen(false); }} />
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportCsv(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>
      <div className="px-3 pb-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="block w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800">
      {label}
    </button>
  );
}
