interface Props {
  listening: boolean;
  onClick: () => void;
}

export function VoiceButton({ listening, onClick }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <button
        onClick={onClick}
        aria-label={listening ? 'Stop listening' : 'Start voice input'}
        className={`relative flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-transform active:scale-95 ${
          listening ? 'bg-red-500' : 'bg-purple-600'
        }`}
      >
        {listening && (
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
        )}
        <span className="relative">🎤</span>
      </button>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {listening ? 'Listening…' : 'Tap & Speak'}
      </span>
    </div>
  );
}
