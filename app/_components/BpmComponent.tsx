"use client";
import React from "react";

import { BpmButton } from "./BpmButton";
import { bpmCalculator } from "../_utils";

type Props = {};

export const BpmComponent: React.FC<Props> = ({}) => {
  const [dateList, setDateList] = React.useState<Date[]>([]);

  const handleButtonClick = React.useCallback(() => {
    setDateList((dateList) => [...dateList, new Date()]);
  }, []);

  const bpm = React.useMemo(() => {
    return bpmCalculator(dateList);
  }, [dateList]);

  // sdの値に応じてbpmの文字の色を変える
  // sdの値は bpm に対しての割合で評価する
  const { sd: _sd, value } = bpm;

  const sd = _sd ?? 50;
  // sd が bpm の値に対してどれぐらいかで評価する
  const ratio = sd && value ? sd / value : 1;

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

  const halfBpm = React.useMemo(() => {
    return bpm.value ? bpm.value / 2 : undefined;
  }, [bpm]);

  const threeFourthBpm = React.useMemo(() => {
    return bpm.value ? (bpm.value * 3) / 4 : undefined;
  }, [bpm]);

  const fourThirdBpm = React.useMemo(() => {
    return bpm.value ? (bpm.value * 4) / 3 : undefined;
  }, [bpm]);

  return (
    <div>
      <BpmButton onButtonClick={handleButtonClick}>
        <div className="w-screen h-screen flex gap-16 justify-center items-center flex-col">
          <p className="text-6xl font-bold">TAP</p>
          <p className={`text-8xl ${bpmColor}`}>
            {bpm.value?.toFixed(1) ?? "🎶"}
          </p>
          <div className="flex flex-col gap-6 justify-center">
            <div className="">
              <p>1/2</p>
              <p className="text-5xl font-bold">{halfBpm?.toFixed(1) ?? "-"}</p>
            </div>
            <div className="">
              <p>3/4</p>
              <p className="text-5xl font-bold">
                {threeFourthBpm?.toFixed(1) ?? "-"}
              </p>
            </div>
            <div className="">
              <p>4/3</p>
              <p className="text-5xl font-bold">
                {fourThirdBpm?.toFixed(1) ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </BpmButton>
      <button
        className="fixed bottom-0 right-0 p-4 bg-gray-100 dark:bg-gray-900"
        onClick={() => {
          setDateList([]);
        }}
      >
        reset
      </button>
    </div>
  );
};
