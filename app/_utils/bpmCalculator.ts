// データとして使用する最大の過去時間
const MAX_PAST_TIME = 20 * 1000;

// これ以上の間隔でのデータは考慮しない
const DIFF_THRESHOLD = 3000;

type Return = {
  value: number | null;
  sd: number | null;
};

/**
 *
 */
export const bpmCalculator: (dateList: Date[]) => Return = (dateList) => {
  // 閾値以内に記録されたデータだけ使う
  const now = new Date();
  const past = new Date(now.getTime() - MAX_PAST_TIME);
  const filteredDateList = dateList.filter(
    (date) => date.getTime() > past.getTime()
  );

  if (filteredDateList.length > 1) {
    // 差分を計算
    const diffList: number[] = filteredDateList.reduce<number[]>(
      (acc, cur, idx, arr) => {
        if (idx > 0) {
          acc.push(cur.getTime() - arr[idx - 1].getTime());
        }
        return acc;
      },
      []
    );

    // 一定の秒数以上の差分は考慮しない
    const filteredDiffList = diffList.filter((diff) => diff < DIFF_THRESHOLD);

    // 平均値からあまりにも外れてるデータも考慮しない

    // 差分の平均値を単純移動平均で計算
    const average =
      filteredDiffList.reduce((acc, cur) => acc + cur, 0) /
      filteredDiffList.length;

    // BPMを計算
    const bpm = 60000 / average;

    // bpm は小数点第一位まで

    // 標準偏差を計算
    const sd = calculateStandardDeviation(filteredDiffList);

    return {
      value: bpm,
      sd: sd,
    };
  }

  return {
    value: null,
    sd: null,
  };
};

const calculateVariance = (list: number[]) => {
  const average = list.reduce((acc, cur) => acc + cur, 0) / list.length;
  return list.reduce((acc, cur) => acc + (cur - average) ** 2, 0) / list.length;
};

// 標準偏差を計算する
const calculateStandardDeviation = (list: number[]) => {
  return Math.sqrt(calculateVariance(list));
};
