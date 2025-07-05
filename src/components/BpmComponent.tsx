import React from "react";

import { BpmButton } from "./BpmButton";
import { SubBpmComponent } from "./SubBpmComponent";
import { useAccuracyColor, useBpmCalculator } from "../hooks";
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
  const { handleAddTimeData, handleClearTimeData, bpm, convertedBpmList } =
    useBpmCalculator({ bpmConvertSettings });

  const { sd } = bpm;

  const bpmColor = useAccuracyColor(sd?.toNumber() ?? 50);

  return (
    <div>
      <BpmButton onButtonClick={handleAddTimeData}>
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
      <button
        className="fixed bottom-0 right-0 p-4 bg-zinc-800"
        onClick={handleClearTimeData}
      >
        reset
      </button>
    </div>
  );
};