import { useEffect, useState } from 'react';
import type { AppSettings, Sheet } from './types/sheet';
import { DEFAULT_SETTINGS } from './types/sheet';
import { deleteSheet, loadInitialState, saveSettings, saveSheet } from './lib/storage';
import { HomeScreen } from './screens/HomeScreen';
import { SpreadsheetScreen } from './screens/SpreadsheetScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type Screen = { name: 'home' } | { name: 'sheet'; id: string } | { name: 'settings' };

export default function App() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadInitialState().then(({ sheets: storedSheets, settings: storedSettings }) => {
      setSheets(storedSheets);
      setSettings(storedSettings);
      setLoaded(true);
    });
  }, []);

  const updateSheet = (sheet: Sheet) => {
    setSheets((prev) => {
      const exists = prev.some((s) => s.id === sheet.id);
      return exists ? prev.map((s) => (s.id === sheet.id ? sheet : s)) : [sheet, ...prev];
    });
    void saveSheet(sheet);
  };

  const updateSettings = (next: AppSettings) => {
    setSettings(next);
    void saveSettings(next);
  };

  const handleDelete = (id: string) => {
    setSheets((prev) => prev.filter((s) => s.id !== id));
    void deleteSheet(id);
    if (screen.name === 'sheet' && screen.id === id) setScreen({ name: 'home' });
  };

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">Loading…</div>
    );
  }

  if (screen.name === 'settings') {
    return <SettingsScreen settings={settings} onChange={updateSettings} onBack={() => setScreen({ name: 'home' })} />;
  }

  if (screen.name === 'sheet') {
    const sheet = sheets.find((s) => s.id === screen.id);
    if (!sheet) {
      setScreen({ name: 'home' });
      return null;
    }
    return (
      <SpreadsheetScreen sheet={sheet} settings={settings} onChange={updateSheet} onBack={() => setScreen({ name: 'home' })} />
    );
  }

  return (
    <HomeScreen
      sheets={sheets}
      onOpen={(id) => setScreen({ name: 'sheet', id })}
      onCreate={(sheet) => {
        updateSheet(sheet);
        setScreen({ name: 'sheet', id: sheet.id });
      }}
      onDelete={handleDelete}
      onOpenSettings={() => setScreen({ name: 'settings' })}
    />
  );
}
