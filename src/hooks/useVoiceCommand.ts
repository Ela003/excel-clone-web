import { useCallback, useRef, useState } from 'react';
import type { RowData, Sheet } from '../types/sheet';
import { parseVoiceCommand, type ParsedCommand } from '../lib/voice/parser';
import { matchRow } from '../lib/voice/matcher';
import { createVoiceListener, isSpeechRecognitionSupported } from '../lib/voice/speech';

export type VoiceStatus =
  | 'idle'
  | 'listening'
  | 'confirm'
  | 'not-found'
  | 'ambiguous'
  | 'no-command'
  | 'unsupported'
  | 'mic-error';

export interface UseVoiceCommandResult {
  status: VoiceStatus;
  transcript: string;
  parsed: ParsedCommand | null;
  matchedRow: RowData | null;
  candidates: RowData[];
  errorMessage: string | null;
  start: () => void;
  cancel: () => void;
  confirm: () => void;
  chooseCandidate: (rowId: string) => void;
}

interface Options {
  sheet: Sheet;
  language: string;
  autoApply: boolean;
  onApply: (rowId: string, values: number[]) => void;
}

export function useVoiceCommand({ sheet, language, autoApply, onApply }: Options): UseVoiceCommandResult {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);
  const [matchedRow, setMatchedRow] = useState<RowData | null>(null);
  const [candidates, setCandidates] = useState<RowData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listenerRef = useRef<ReturnType<typeof createVoiceListener>>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setTranscript('');
    setParsed(null);
    setMatchedRow(null);
    setCandidates([]);
    setErrorMessage(null);
  }, []);

  const processTranscript = useCallback(
    (text: string) => {
      setTranscript(text);
      const command = parseVoiceCommand(text);

      if (!command) {
        setStatus('no-command');
        setErrorMessage(`Couldn't understand "${text}". Try "<name> <numbers>".`);
        return;
      }
      setParsed(command);

      const result = matchRow(command.rowName, sheet.rows);

      if (result.type === 'not-found') {
        setStatus('not-found');
        setErrorMessage(`"${command.rowName}" was not found. Add this name to the sheet first.`);
        return;
      }

      if (result.type === 'ambiguous') {
        setStatus('ambiguous');
        setCandidates(result.candidates);
        return;
      }

      setMatchedRow(result.row);
      if (autoApply) {
        onApply(result.row.id, command.values);
        reset();
      } else {
        setStatus('confirm');
      }
    },
    [sheet.rows, autoApply, onApply, reset]
  );

  const start = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setStatus('unsupported');
      setErrorMessage('Voice input is not supported in this browser.');
      return;
    }

    reset();
    setStatus('listening');

    const listener = createVoiceListener(language, {
      onInterim: (text) => setTranscript(text),
      onFinal: (text) => processTranscript(text),
      onError: (error) => {
        setStatus('mic-error');
        setErrorMessage(error === 'not-allowed' ? 'Microphone access was denied.' : `Voice error: ${error}`);
      },
      onEnd: () => {
        listenerRef.current = null;
      },
    });

    if (!listener) {
      setStatus('unsupported');
      setErrorMessage('Voice input is not supported in this browser.');
      return;
    }

    listenerRef.current = listener;
    listener.start();
  }, [language, processTranscript, reset]);

  const cancel = useCallback(() => {
    listenerRef.current?.stop();
    reset();
  }, [reset]);

  const confirm = useCallback(() => {
    if (matchedRow && parsed) {
      onApply(matchedRow.id, parsed.values);
    }
    reset();
  }, [matchedRow, parsed, onApply, reset]);

  const chooseCandidate = useCallback(
    (rowId: string) => {
      const row = candidates.find((c) => c.id === rowId);
      if (!row || !parsed) return;
      setMatchedRow(row);
      setCandidates([]);
      if (autoApply) {
        onApply(row.id, parsed.values);
        reset();
      } else {
        setStatus('confirm');
      }
    },
    [candidates, parsed, autoApply, onApply, reset]
  );

  return { status, transcript, parsed, matchedRow, candidates, errorMessage, start, cancel, confirm, chooseCandidate };
}
