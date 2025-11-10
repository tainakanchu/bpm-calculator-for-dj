import React from "react";

const DEFAULT_BUFFER_SIZE = 2048;
const ENERGY_HISTORY_SIZE = 43;
const DEFAULT_SENSITIVITY = 1.6;
const DEFAULT_MIN_INTERVAL = 250;

const hasMediaDevicesSupport = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return !!navigator?.mediaDevices?.getUserMedia;
};

export type MicrophoneBeatDetectorOptions = {
  onBeat: () => void;
  sensitivity?: number;
  minIntervalMs?: number;
};

export type MicrophoneBeatDetectorState = {
  start: () => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
};

export const useMicrophoneBeatDetector = (
  options: MicrophoneBeatDetectorOptions
): MicrophoneBeatDetectorState => {
  const { onBeat, sensitivity = DEFAULT_SENSITIVITY, minIntervalMs = DEFAULT_MIN_INTERVAL } = options;

  const isSupported = React.useMemo(() => hasMediaDevicesSupport(), []);

  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafIdRef = React.useRef<number | null>(null);
  const dataArrayRef = React.useRef<Float32Array | null>(null);
  const energyHistoryRef = React.useRef<number[]>([]);
  const lastBeatTimestampRef = React.useRef<number>(0);

  const cleanup = React.useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    dataArrayRef.current = null;
    energyHistoryRef.current = [];
    lastBeatTimestampRef.current = 0;
  }, []);

  const stop = React.useCallback(() => {
    cleanup();
    setIsListening(false);
  }, [cleanup]);

  const handleEnergySample = React.useCallback(() => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray) {
      return;
    }

    analyser.getFloatTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i += 1) {
      const value = dataArray[i];
      sumSquares += value * value;
    }

    const rms = Math.sqrt(sumSquares / dataArray.length);

    const history = energyHistoryRef.current;
    history.push(rms);
    if (history.length > ENERGY_HISTORY_SIZE) {
      history.shift();
    }

    if (history.length >= ENERGY_HISTORY_SIZE / 2) {
      const mean = history.reduce((acc, value) => acc + value, 0) / history.length;
      const variance = history.reduce((acc, value) => acc + (value - mean) ** 2, 0) / history.length;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + stdDev * sensitivity;

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (rms > threshold && now - lastBeatTimestampRef.current > minIntervalMs) {
        lastBeatTimestampRef.current = now;
        onBeat();
      }
    }

    rafIdRef.current = requestAnimationFrame(handleEnergySample);
  }, [minIntervalMs, onBeat, sensitivity]);

  const start = React.useCallback(async () => {
    if (!isSupported) {
      setError("マイク入力に対応していないブラウザです。");
      return;
    }

    if (isListening) {
      return;
    }

    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextConstructor =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error("AudioContext を初期化できませんでした。");
      }

      const audioContext = new AudioContextConstructor();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      streamRef.current = stream;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = DEFAULT_BUFFER_SIZE;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      source.connect(analyser);

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNodeRef.current = gainNode;

      dataArrayRef.current = new Float32Array(analyser.fftSize);

      setIsListening(true);
      rafIdRef.current = requestAnimationFrame(handleEnergySample);
    } catch (err) {
      const message = err instanceof Error ? err.message : "マイクの初期化に失敗しました。";
      setError(message);
      stop();
    }
  }, [handleEnergySample, isListening, isSupported, stop]);

  React.useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    isSupported,
    isListening,
    error,
  };
};
