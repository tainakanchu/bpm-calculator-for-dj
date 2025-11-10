import React from "react";

import { BpmButton } from "./BpmButton";
import { SubBpmComponent } from "./SubBpmComponent";
import {
  useAccuracyColor,
  useBpmCalculator,
  useMicrophoneBeatDetector,
} from "../hooks";
import type { MicrophoneBeatDetectorResult } from "../hooks";
import { BpmConvertSetting } from "../types/BpmConvertSetting";
import BigNumber from "bignumber.js";

type Props = Record<string, never>;

const bpmConvertSettings: BpmConvertSetting[] = [
  {
    numerator: 1,
    denominator: 2,
  },
  {
    numerator: 3,
    denominator: 4,
  },
  {
    numerator: 4,
    denominator: 3,
  },
];

BigNumber.config({ DECIMAL_PLACES: 150 });

export const BpmComponent: React.FC<Props> = () => {
  const {
    handleAddTimeData,
    handleClearTimeData,
    applyBpmEstimate,
    bpm,
    convertedBpmList,
  } = useBpmCalculator({ bpmConvertSettings });

  const { sd } = bpm;

  const bpmColor = useAccuracyColor(sd?.toNumber() ?? 50);

  const [lastDetectedBpm, setLastDetectedBpm] = React.useState<number | null>(
    null
  );

  const handleMicrophoneResult = React.useCallback(
    ({ bpm: detectedBpm }: MicrophoneBeatDetectorResult) => {
      applyBpmEstimate(detectedBpm);
      setLastDetectedBpm(detectedBpm);
    },
    [applyBpmEstimate]
  );

  const {
    start: startMicrophone,
    stop: stopMicrophone,
    isRecording: isMicrophoneRecording,
    isProcessing: isMicrophoneProcessing,
    isSupported: isMicrophoneSupported,
    error: microphoneError,
  } = useMicrophoneBeatDetector({
    onBpmDetected: handleMicrophoneResult,
  });

  const toggleMicrophone = React.useCallback(() => {
    if (isMicrophoneRecording || isMicrophoneProcessing) {
      stopMicrophone();
    } else {
      setLastDetectedBpm(null);
      void startMicrophone();
    }
  }, [
    isMicrophoneProcessing,
    isMicrophoneRecording,
    startMicrophone,
    stopMicrophone,
  ]);

  return (
    <div>
      <BpmButton
        onButtonClick={handleAddTimeData}
        disabled={isMicrophoneRecording || isMicrophoneProcessing}
      >
        <div className="w-screen h-screen flex gap-16 flex-wrap justify-center items-center flex-col sm:flex-row">
          <div className="flex gap-16 justify-center items-center flex-col">
            <p className="text-6xl font-bold">TAP</p>
            <p className={`text-8xl ${bpmColor}`}>
              {bpm.value?.toFixed(1) ?? "🎶"}
            </p>
          </div>
          <div className="flex flex-col gap-6 justify-center">
            {convertedBpmList.map((convertedBpm) => {
              return (
                <SubBpmComponent
                  key={convertedBpm.label}
                  title={convertedBpm.label}
                  value={convertedBpm.value?.toFixed(1) ?? "-"}
                />
              );
            })}
          </div>
        </div>
      </BpmButton>
      <div className="fixed top-0 left-0 p-4 flex flex-col gap-2 text-sm">
        <button
          type="button"
          onClick={toggleMicrophone}
          disabled={!isMicrophoneSupported}
          className={`px-3 py-2 rounded border border-zinc-600 bg-zinc-900 transition-colors ${
            isMicrophoneRecording || isMicrophoneProcessing
              ? "text-emerald-300 border-emerald-400"
              : "text-zinc-200 hover:border-sky-400 hover:text-sky-300"
          } ${!isMicrophoneSupported ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isMicrophoneRecording || isMicrophoneProcessing
            ? "Stop microphone"
            : "Start microphone"}
        </button>
        {!isMicrophoneSupported && (
          <p className="max-w-xs text-zinc-400">
            お使いのブラウザではマイク入力がサポートされていません。
          </p>
        )}
        {microphoneError && (
          <p className="max-w-xs text-red-400">{microphoneError}</p>
        )}
        {isMicrophoneRecording && (
          <p className="text-emerald-300">Recording from microphone…</p>
        )}
        {isMicrophoneProcessing && (
          <p className="text-amber-300">Analyzing audio for BPM…</p>
        )}
        {lastDetectedBpm && !isMicrophoneRecording && !isMicrophoneProcessing && (
          <p className="text-sky-300">
            マイク推定: {lastDetectedBpm.toFixed(1)} BPM
          </p>
        )}
      </div>
      <button
        className="fixed bottom-0 right-0 p-4 bg-zinc-800"
        onClick={handleClearTimeData}
      >
        reset
      </button>
    </div>
  );
};
