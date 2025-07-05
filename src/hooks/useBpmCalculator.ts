import React from "react";
import { calculateBpm } from "../utils";
import { BpmConvertSetting } from "../types/BpmConvertSetting";
import { BpmStatisticInfoOrEmpty } from "../types";

/**
 * BPMを計算するフック
 *
 * @param setting BPMを変換する設定
 * @returns BPMを計算するフック
 */
export const useBpmCalculator = (setting: {
  bpmConvertSettings: BpmConvertSetting[];
}) => {
  const [dateList, setDateList] = React.useState<Date[]>([]);

  const handleAddTimeData = React.useCallback(() => {
    setDateList((dateList) => [...dateList, new Date()]);
  }, []);

  const handleClearTimeData = React.useCallback(() => {
    setDateList([]);
  }, []);

  const bpm: BpmStatisticInfoOrEmpty = React.useMemo(() => {
    return calculateBpm(dateList);
  }, [dateList]);

  const convertedBpmList = React.useMemo(() => {
    return setting.bpmConvertSettings.map((setting) => {
      const label = `${setting.numerator}/${setting.denominator}`;
      return {
        label,
        value: bpm.value
          ? bpm.value.times(setting.numerator).div(setting.denominator)
          : null,
      };
    });
  }, [bpm.value, setting]);

  return {
    handleAddTimeData,
    handleClearTimeData,
    bpm,
    convertedBpmList,
  };
};