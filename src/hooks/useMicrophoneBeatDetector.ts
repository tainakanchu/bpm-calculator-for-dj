import React from "react";
import { guess } from "web-audio-beat-detector";

const DEFAULT_SAMPLE_DURATION_MS = 12000;

type AudioContextConstructor = typeof AudioContext;

type ExtendedWindow = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

const getAudioContextConstructor = (): AudioContextConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const ctor = window.AudioContext ?? (window as ExtendedWindow).webkitAudioContext;

  return ctor ?? null;
};

const hasMicrophoneSupport = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const hasMediaDevices = typeof navigator.mediaDevices?.getUserMedia === "function";
  const hasMediaRecorder = "MediaRecorder" in window;
  const hasAudioContext = getAudioContextConstructor() !== null;

  return hasMediaDevices && hasMediaRecorder && hasAudioContext;
};

export type MicrophoneBeatDetectorResult = {
  bpm: number;
  offset: number;
};

export type MicrophoneBeatDetectorOptions = {
  onBpmDetected: (result: MicrophoneBeatDetectorResult) => void;
  sampleDurationMs?: number;
  tempoSettings?: {
    maxTempo?: number;
    minTempo?: number;
  };
};

export type MicrophoneBeatDetectorState = {
  start: () => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
};

export const useMicrophoneBeatDetector = (
  options: MicrophoneBeatDetectorOptions
): MicrophoneBeatDetectorState => {
  const { onBpmDetected, sampleDurationMs = DEFAULT_SAMPLE_DURATION_MS, tempoSettings } = options;

  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSupported = React.useMemo(() => hasMicrophoneSupport(), []);

  const onBpmDetectedRef = React.useRef(onBpmDetected);
  React.useEffect(() => {
    onBpmDetectedRef.current = onBpmDetected;
  }, [onBpmDetected]);

  const tempoSettingsRef = React.useRef(tempoSettings);
  React.useEffect(() => {
    tempoSettingsRef.current = tempoSettings;
  }, [tempoSettings]);

  const chunksRef = React.useRef<Blob[]>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recorderListenersRef = React.useRef<{
    data: (event: BlobEvent) => void;
    stop: () => void;
  } | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recordingTimeoutRef = React.useRef<number | null>(null);
  const isMountedRef = React.useRef(true);

  const clearRecordingTimeout = React.useCallback(() => {
    if (recordingTimeoutRef.current !== null) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const resetRecorder = React.useCallback(() => {
    clearRecordingTimeout();

    const recorder = mediaRecorderRef.current;
    const listeners = recorderListenersRef.current;

    if (recorder && listeners) {
      recorder.removeEventListener("dataavailable", listeners.data);
      recorder.removeEventListener("stop", listeners.stop);
    }

    recorderListenersRef.current = null;
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
  }, [clearRecordingTimeout]);

  const processChunks = React.useCallback(
    async (chunks: Blob[], mimeType: string) => {
      if (chunks.length === 0) {
        throw new Error("マイクからの音声が取得できませんでした。");
      }

      const AudioContextCtor = getAudioContextConstructor();
      if (!AudioContextCtor) {
        throw new Error("AudioContext を初期化できませんでした。");
      }

      const audioContext = new AudioContextCtor();

      try {
        const blob = new Blob(chunks, { type: mimeType });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const tempoSettings = tempoSettingsRef.current;
        const result = tempoSettings
          ? await guess(audioBuffer, tempoSettings)
          : await guess(audioBuffer);

        if (!Number.isFinite(result.bpm)) {
          throw new Error("BPM を推定できませんでした。");
        }

        if (isMountedRef.current) {
          setError(null);
          onBpmDetectedRef.current(result);
        }
      } finally {
        await audioContext.close();
      }
    },
    []
  );

  const handleRecorderStop = React.useCallback(async () => {
    clearRecordingTimeout();

    const recorder = mediaRecorderRef.current;
    const mimeType = recorder?.mimeType ?? "audio/webm";
    const chunks = chunksRef.current.slice();
    chunksRef.current = [];

    resetRecorder();

    if (!isMountedRef.current) {
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await processChunks(chunks, mimeType);
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : "マイクの解析に失敗しました。";
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [clearRecordingTimeout, processChunks, resetRecorder]);

  const start = React.useCallback(async () => {
    if (!isSupported) {
      setError("マイク入力に対応していないブラウザです。");
      return;
    }

    if (isRecording || isProcessing) {
      return;
    }

    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      const handleDataAvailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      const handleStop = () => {
        void handleRecorderStop();
      };

      recorder.addEventListener("dataavailable", handleDataAvailable);
      recorder.addEventListener("stop", handleStop);
      recorderListenersRef.current = {
        data: handleDataAvailable,
        stop: handleStop,
      };

      recorder.start();

      if (isMountedRef.current) {
        setIsRecording(true);
      }

      recordingTimeoutRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, sampleDurationMs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "マイクの初期化に失敗しました。";
      if (isMountedRef.current) {
        setError(message);
        setIsRecording(false);
        setIsProcessing(false);
      }
      resetRecorder();
    }
  }, [handleRecorderStop, isProcessing, isRecording, isSupported, resetRecorder, sampleDurationMs]);

  const stop = React.useCallback(() => {
    clearRecordingTimeout();

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      resetRecorder();
      if (isMountedRef.current) {
        setIsRecording(false);
        setIsProcessing(false);
      }
    }
  }, [clearRecordingTimeout, resetRecorder]);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    isSupported,
    isRecording,
    isProcessing,
    error,
  };
};
