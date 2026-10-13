import type { UseVoiceCommandResult } from '../hooks/useVoiceCommand';

interface Props {
  voice: UseVoiceCommandResult;
}

function OverlayCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        {children}
      </div>
    </div>
  );
}

export function VoicePanel({ voice }: Props) {
  const { status, transcript, parsed, matchedRow, candidates, errorMessage, cancel, confirm, chooseCandidate } = voice;

  if (status === 'idle') return null;

  if (status === 'listening') {
    return (
      <OverlayCard>
        <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Listening…</p>
        <p className="mt-1 min-h-[1.5em] text-lg text-neutral-800 dark:text-neutral-100">
          {transcript || 'Say a name followed by numbers'}
        </p>
        <button
          onClick={cancel}
          className="mt-3 w-full rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
        >
          Cancel
        </button>
      </OverlayCard>
    );
  }

  if (status === 'confirm' && matchedRow && parsed) {
    return (
      <OverlayCard>
        <p className="text-xs font-medium uppercase tracking-wide text-purple-500">You said</p>
        <p className="mt-1 text-lg text-neutral-800 dark:text-neutral-100">
          {matchedRow.cells[0]?.value} → {parsed.values.join(' → ')}
        </p>
        <p className="mt-1 text-sm text-neutral-500">Update {matchedRow.cells[0]?.value}?</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={cancel}
            className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
          >
            Cancel
          </button>
          <button onClick={confirm} className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-medium text-white">
            Apply
          </button>
        </div>
      </OverlayCard>
    );
  }

  if (status === 'ambiguous') {
    return (
      <OverlayCard>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Which row did you mean?</p>
        <div className="mt-2 flex flex-col gap-1">
          {candidates.map((c) => (
            <button
              key={c.id}
              onClick={() => chooseCandidate(c.id)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-purple-50 dark:border-neutral-700 dark:hover:bg-purple-950/40"
            >
              {c.cells[0]?.value}
            </button>
          ))}
        </div>
        <button
          onClick={cancel}
          className="mt-3 w-full rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
        >
          Cancel
        </button>
      </OverlayCard>
    );
  }

  if (status === 'not-found' || status === 'no-command' || status === 'mic-error' || status === 'unsupported') {
    return (
      <OverlayCard>
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        <button onClick={cancel} className="mt-3 w-full rounded-lg bg-neutral-800 py-2 text-sm text-white dark:bg-neutral-700">
          OK
        </button>
      </OverlayCard>
    );
  }

  return null;
}
