import { useMemo, useState } from 'react';
import type { AppSettings, Sheet } from '../types/sheet';
import { Toolbar } from '../components/Toolbar';
import { SpreadsheetGrid } from '../components/SpreadsheetGrid';
import { VoiceButton } from '../components/VoiceButton';
import { VoicePanel } from '../components/VoicePanel';
import { useVoiceCommand } from '../hooks/useVoiceCommand';
import {
  addColumn,
  addRow,
  applyValuesToRow,
  deleteColumn,
  deleteRow,
  renameColumn,
  renameSheet,
  setCellValue,
  sortByColumn,
} from '../lib/sheetEngine';
import { csvToSheet, downloadTextFile, sheetToCsv, sheetToJson } from '../lib/csv';

interface Props {
  sheet: Sheet;
  settings: AppSettings;
  onChange: (sheet: Sheet) => void;
  onBack: () => void;
}

export function SpreadsheetScreen({ sheet, settings, onChange, onBack }: Props) {
  const [search, setSearch] = useState('');
  const [highlightRowId, setHighlightRowId] = useState<string | null>(null);

  const voice = useVoiceCommand({
    sheet,
    language: settings.voiceLanguage,
    autoApply: settings.autoApply || !settings.confirmationMode,
    onApply: (rowId, values) => {
      onChange(applyValuesToRow(sheet, rowId, values));
      setHighlightRowId(rowId);
      window.setTimeout(() => setHighlightRowId((cur) => (cur === rowId ? null : cur)), 1500);
    },
  });

  const filteredSheet = useMemo(() => {
    if (!search.trim()) return sheet;
    const q = search.trim().toLowerCase();
    return { ...sheet, rows: sheet.rows.filter((r) => r.cells.some((c) => c.value.toLowerCase().includes(q))) };
  }, [sheet, search]);

  return (
    <div className="flex min-h-full flex-col">
      <Toolbar
        sheetName={sheet.name}
        search={search}
        onSearchChange={setSearch}
        onBack={onBack}
        onRenameSheet={(name) => onChange(renameSheet(sheet, name))}
        onAddRow={() => onChange(addRow(sheet))}
        onAddColumn={() => onChange(addColumn(sheet))}
        onImportCsv={(file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const imported = csvToSheet(String(reader.result), sheet.name);
            onChange({ ...imported, id: sheet.id, createdAt: sheet.createdAt });
          };
          reader.readAsText(file);
        }}
        onExportCsv={() => downloadTextFile(`${sheet.name}.csv`, sheetToCsv(sheet), 'text/csv')}
        onExportJson={() => downloadTextFile(`${sheet.name}.json`, sheetToJson(sheet), 'application/json')}
      />

      <div className="flex-1 pb-40">
        <SpreadsheetGrid
          sheet={filteredSheet}
          highlightRowId={highlightRowId}
          onCellChange={(rowId, colIndex, value) => onChange(setCellValue(sheet, rowId, colIndex, value))}
          onDeleteRow={(rowId) => onChange(deleteRow(sheet, rowId))}
          onRenameColumn={(colIndex, name) => onChange(renameColumn(sheet, colIndex, name))}
          onDeleteColumn={(colIndex) => onChange(deleteColumn(sheet, colIndex))}
          onSort={(colIndex) => onChange(sortByColumn(sheet, colIndex, 'asc'))}
        />
      </div>

      <VoicePanel voice={voice} />

      <div
        className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <VoiceButton listening={voice.status === 'listening'} onClick={voice.status === 'idle' ? voice.start : voice.cancel} />
      </div>
    </div>
  );
}
