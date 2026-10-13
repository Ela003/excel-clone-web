// Minimal ambient types for the Web Speech API (not in default TS lib.dom yet).
interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: { [index: number]: { transcript: string }; isFinal: boolean };
    length: number;
  };
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export interface VoiceListenerHandlers {
  onInterim?: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface VoiceListener {
  start: () => void;
  stop: () => void;
}

export function createVoiceListener(lang: string, handlers: VoiceListenerHandlers): VoiceListener | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? '';
      if (result.isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript) handlers.onInterim?.(interimTranscript);
    if (finalTranscript) handlers.onFinal(finalTranscript);
  };

  recognition.onerror = (event) => {
    handlers.onError?.(event.error ?? 'unknown-error');
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
