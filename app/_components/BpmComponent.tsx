"use client";
import React from "react";

import { BpmButton } from "./BpmButton";
import { SubBpmComponent } from "./SubBpmComponent";
import { useBpmCalculator } from "../_hooks";
import { BpmConvertSetting } from "../_types/BpmConvertSetting";

type Props = {};

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

export const BpmComponent: React.FC<Props> = ({}) => {
  const { handleAddTimeData, handleClearTimeData, bpm, convertedBpmList } =
    useBpmCalculator({ bpmConvertSettings });

  const { sd: _sd, value } = bpm;

  const sd = _sd ?? 50;

  // 5刻みぐらいで色を変える
  const bpmColor = React.useMemo(() => {
    if (sd < 30) {
      return "text-green-500";
    } else if (sd < 35) {
      return "text-green-400";
    } else if (sd < 40) {
      return "text-green-300";
    } else if (sd < 45) {
      return "text-yellow-200";
    } else if (sd < 50) {
      return "text-yellow-100";
    } else if (sd < 55) {
      return "text-red-100";
    } else if (sd < 60) {
      return "text-red-200";
    } else if (sd < 65) {
      return "text-red-300";
    } else if (sd < 70) {
      return "text-red-400";
    } else {
      return "text-red-500";
    }
  }, [sd]);

  return (
    <div>
      <BpmButton onButtonClick={handleAddTimeData}>
        <div className="w-screen h-screen flex gap-16 justify-center items-center flex-col">
          <p className="text-6xl font-bold">TAP</p>
          <p className={`text-8xl ${bpmColor}`}>{value?.toFixed(1) ?? "🎶"}</p>
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
      <button
        className="fixed bottom-0 right-0 p-4 bg-zinc-800"
        onClick={handleClearTimeData}
      >
        reset
      </button>
    </div>
  );
};
