import React from "react";
import { calculateBpm } from "../_utils";
import { BpmConvertSetting } from "../_types/BpmConvertSetting";

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

  const bpm = React.useMemo(() => {
    return calculateBpm(dateList);
  }, [dateList]);

  const convertedBpmList = React.useMemo(() => {
    return setting.bpmConvertSettings.map((setting) => {
      const label: string = `${setting.numerator}/${setting.denominator}`;
      return {
        label,
        value: bpm.value
          ? (bpm.value * setting.numerator) / setting.denominator
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
