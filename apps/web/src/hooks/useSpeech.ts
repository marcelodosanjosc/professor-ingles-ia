import { useState, useRef, useEffect, useCallback } from 'react';

// Declaração de tipos para SpeechRecognition webkit compatível
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionResultItem;
  length: number;
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    [index: number]: SpeechRecognitionResultLike;
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseSpeechOptions {
  defaultLang?: string;
  onExposureSec?: (sec: number) => void;
  onSpeakingSec?: (sec: number) => void;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { defaultLang = 'en-US', onExposureSec, onSpeakingSec } = options;

  // Estados TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [exposureSec, setExposureSec] = useState(0);
  const ttsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttsSimulationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados STT
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speakingSec, setSpeakingSec] = useState(0);
  const sttIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const isSttSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // --------------------------------------------------------------------------
  // TTS (Text-to-Speech)
  // --------------------------------------------------------------------------

  const stopSpeaking = useCallback(() => {
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
      ttsIntervalRef.current = null;
    }
    if (ttsSimulationTimeoutRef.current) {
      clearTimeout(ttsSimulationTimeoutRef.current);
      ttsSimulationTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // silencioso
      }
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, lang = defaultLang, rate = 1) => {
      if (!text || !text.trim()) return;

      stopSpeaking();
      setIsSpeaking(true);

      // Inicia contagem de segundos de exposição auditiva
      ttsIntervalRef.current = setInterval(() => {
        setExposureSec((prev) => {
          const next = prev + 1;
          onExposureSec?.(1);
          return next;
        });
      }, 1000);

      if (isTtsSupported) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          utterance.rate = rate;

          utterance.onend = () => {
            stopSpeaking();
          };

          utterance.onerror = () => {
            stopSpeaking();
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          // Fallback caso a síntese falhe
          const simTime = Math.min(3000, Math.max(500, text.length * 40));
          ttsSimulationTimeoutRef.current = setTimeout(() => {
            stopSpeaking();
          }, simTime);
        }
      } else {
        // Fallback para ambientes sem TTS (ex: testes / navegadores sem API)
        const simTime = Math.min(2000, Math.max(300, text.length * 20));
        ttsSimulationTimeoutRef.current = setTimeout(() => {
          stopSpeaking();
        }, simTime);
      }
    },
    [defaultLang, isTtsSupported, onExposureSec, stopSpeaking]
  );

  // --------------------------------------------------------------------------
  // STT (Speech-to-Text)
  // --------------------------------------------------------------------------

  const stopListening = useCallback(() => {
    if (sttIntervalRef.current) {
      clearInterval(sttIntervalRef.current);
      sttIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // já estava parado
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (lang = defaultLang) => {
      stopListening();

      // Inicia timer de contagem de fala ativa
      sttIntervalRef.current = setInterval(() => {
        setSpeakingSec((prev) => {
          const next = prev + 1;
          onSpeakingSec?.(1);
          return next;
        });
      }, 1000);

      if (isSttSupported) {
        try {
          const RecognitionClass =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          if (RecognitionClass) {
            const recognition = new RecognitionClass();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = lang;

            recognition.onstart = () => {
              setIsListening(true);
            };

            recognition.onresult = (event: SpeechRecognitionEventLike) => {
              let currentTranscript = '';
              for (let i = 0; i < event.results.length; i++) {
                const item = event.results[i]?.[0];
                if (item?.transcript) {
                  currentTranscript += item.transcript;
                }
              }
              if (currentTranscript) {
                setTranscript(currentTranscript);
              }
            };

            recognition.onerror = () => {
              stopListening();
            };

            recognition.onend = () => {
              stopListening();
            };

            recognitionRef.current = recognition;
            recognition.start();
            setIsListening(true);
            return;
          }
        } catch {
          // Fallback silencioso
        }
      }

      // Em ambiente de simulação/teste sem SpeechRecognition nativo
      setIsListening(true);
    },
    [defaultLang, isSttSupported, onSpeakingSec, stopListening]
  );

  const resetCounters = useCallback(() => {
    setSpeakingSec(0);
    setExposureSec(0);
  }, []);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopListening, stopSpeaking]);

  return {
    // TTS
    speak,
    stopSpeaking,
    isSpeaking,
    exposureSec,
    isTtsSupported,

    // STT
    startListening,
    stopListening,
    transcript,
    setTranscript,
    isListening,
    speakingSec,
    supported: isSttSupported,

    // Utilidades
    resetCounters,
  };
}
