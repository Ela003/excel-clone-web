import type { AppSettings } from '../types/sheet';

interface Props {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'hi-IN', label: 'Hindi' },
];

export function SettingsScreen({ settings, onChange, onBack }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-8" style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}>
      <div className="flex items-center gap-2 py-4">
        <button onClick={onBack} className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          ←
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <SettingRow label="Voice language" description="Language used for speech recognition">
        <select
          value={settings.voiceLanguage}
          onChange={(e) => onChange({ ...settings, voiceLanguage: e.target.value })}
          className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </SettingRow>

      <SettingRow label="Confirmation mode" description="Show a confirmation before applying a voice update">
        <Toggle checked={settings.confirmationMode} onChange={(v) => onChange({ ...settings, confirmationMode: v })} />
      </SettingRow>

      <SettingRow label="Auto-apply" description="Skip confirmation and update the sheet immediately (fast mode)">
        <Toggle checked={settings.autoApply} onChange={(v) => onChange({ ...settings, autoApply: v })} />
      </SettingRow>

      <SettingRow label="Theme" description="Appearance of the app">
        <select
          value={settings.theme}
          onChange={(e) => onChange({ ...settings, theme: e.target.value as AppSettings['theme'] })}
          className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </SettingRow>

      <p className="mt-6 text-xs text-neutral-400">
        Data is stored locally on this device. Export a sheet as CSV or JSON from the sheet menu to back it up.
      </p>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-4 dark:border-neutral-800">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
