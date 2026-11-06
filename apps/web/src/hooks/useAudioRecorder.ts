import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioRecorderReturn {
  audioUrl: string | null;
  audioBlob: Blob | null;
  isRecording: boolean;
  durationSec: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
  supported: boolean;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDurationSec(0);
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return new Promise<void>((resolve) => {
        const recorder = mediaRecorderRef.current!;
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
          chunksRef.current = [];
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
          setIsRecording(false);
          stopTracks();
          resolve();
        };
        try {
          recorder.stop();
        } catch {
          setIsRecording(false);
          stopTracks();
          resolve();
        }
      });
    }

    // Se estava em gravação simulada
    setIsRecording(false);
    stopTracks();
  }, [stopTracks]);

  const startRecording = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignora erro caso já tenha sido finalizado
      }
    }
    stopTracks();
    clearRecording();
    setError(null);

    if (!isSupported) {
      // Fallback amigável sem quebrar execução
      setError('Microfone ou MediaRecorder não suportado neste ambiente.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDurationSec(0);

      timerRef.current = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível acessar o microfone. Verifique as permissões.';
      setError(msg);
      setIsRecording(false);
      stopTracks();
    }
  }, [clearRecording, isSupported, stopTracks]);

  // Limpeza de recursos ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignora erro
        }
      }
      stopTracks();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, stopTracks]);

  return {
    audioUrl,
    audioBlob,
    isRecording,
    durationSec,
    startRecording,
    stopRecording,
    clearRecording,
    supported: isSupported,
    error,
  };
}
