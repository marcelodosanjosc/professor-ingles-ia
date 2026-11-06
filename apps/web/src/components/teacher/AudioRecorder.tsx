import { useEffect } from 'react';
import { Mic, MicOff, Square, Play, Trash2, Volume2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSpeech } from '../../hooks/useSpeech';

export interface AudioRecorderProps {
  label?: string;
  transcript?: string;
  onTranscriptChange?: (text: string) => void;
  onAudioRecorded?: (blob: Blob, url: string) => void;
  onExposureSec?: (sec: number) => void;
  onSpeakingSec?: (sec: number) => void;
  lang?: string;
  placeholder?: string;
  className?: string;
}

export function AudioRecorder({
  label = 'Gravar resposta em áudio',
  transcript: externalTranscript,
  onTranscriptChange,
  onAudioRecorded,
  onExposureSec,
  onSpeakingSec,
  lang = 'en-US',
  placeholder = 'Sua transcrição em texto aparecerá aqui...',
  className = '',
}: AudioRecorderProps) {
  const {
    audioUrl,
    audioBlob,
    isRecording,
    durationSec,
    startRecording,
    stopRecording,
    clearRecording,
    supported: isRecorderSupported,
    error: recorderError,
  } = useAudioRecorder();

  const {
    startListening,
    stopListening,
    transcript: speechTranscript,
    setTranscript: setSpeechTranscript,
    isListening,
    speak,
    isSpeaking,
  } = useSpeech({
    defaultLang: lang,
    onExposureSec,
    onSpeakingSec,
  });

  // Atualiza transcrição interna/externa quando STT capta fala
  useEffect(() => {
    if (speechTranscript && onTranscriptChange) {
      onTranscriptChange(speechTranscript);
    }
  }, [speechTranscript, onTranscriptChange]);

  // Se vier áudio blob gravado, avisa componente pai
  useEffect(() => {
    if (audioBlob && audioUrl && onAudioRecorded) {
      onAudioRecorded(audioBlob, audioUrl);
    }
  }, [audioBlob, audioUrl, onAudioRecorded]);

  const activeTranscript =
    externalTranscript !== undefined ? externalTranscript : speechTranscript;

  const handleStartRecording = async () => {
    // Inicia gravação de áudio real do microfone
    await startRecording();
    // Inicia reconhecimento de fala simultâneo
    startListening(lang);
  };

  const handleStopRecording = async () => {
    await stopRecording();
    stopListening();
  };

  const handleClear = () => {
    clearRecording();
    setSpeechTranscript('');
    if (onTranscriptChange) {
      onTranscriptChange('');
    }
  };

  const formatSec = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs md:text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Mic className="w-4 h-4 text-violet-400" aria-hidden="true" />
          <span>{label}</span>
        </label>

        {isRecording && (
          <div className="flex items-center gap-2" aria-live="polite">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <Badge variant="rose" size="sm">
              Gravando • {formatSec(durationSec)}
            </Badge>
          </div>
        )}
      </div>

      {recorderError && (
        <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl">
          {recorderError}
        </div>
      )}

      {/* Área de Transcrição */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" aria-hidden="true" />
            Transcrição por voz (STT)
          </span>
          {activeTranscript && (
            <button
              type="button"
              onClick={() => speak(activeTranscript, lang)}
              disabled={isSpeaking}
              className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 cursor-pointer"
              title="Ouvir minha transcrição com TTS"
            >
              <Volume2 className="w-3 h-3" />
              <span>{isSpeaking ? 'Falando...' : 'Ouvir pronúncia'}</span>
            </button>
          )}
        </div>

        <textarea
          value={activeTranscript}
          onChange={(e) => {
            const val = e.target.value;
            setSpeechTranscript(val);
            onTranscriptChange?.(val);
          }}
          placeholder={placeholder}
          rows={3}
          className="w-full text-xs md:text-sm bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Áudio Gravado */}
      {audioUrl && (
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
          <div className="text-[11px] text-slate-400 font-medium">Ouça sua gravação:</div>
          <audio
            controls
            src={audioUrl}
            className="w-full h-9 rounded-lg"
            aria-label="Player de áudio gravado"
          />
        </div>
      )}

      {/* Barra de Controles */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!isRecording ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleStartRecording}
            leftIcon={<Mic className="w-4 h-4" />}
            title="Iniciar gravação de voz"
          >
            {audioUrl ? 'Gravar novamente' : 'Falar no microfone'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleStopRecording}
            leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
            title="Parar gravação"
          >
            Parar gravação
          </Button>
        )}

        {(audioUrl || activeTranscript) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            title="Limpar transcrição e áudio"
          >
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
