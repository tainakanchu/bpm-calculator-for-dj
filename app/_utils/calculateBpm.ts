// データとして使用する最大の過去時間
const MAX_PAST_TIME = 20 * 1000;

// これ以上の間隔でのデータは考慮しない
const DIFF_THRESHOLD = 3000;

const simpleMovingAverageHandler =
  (count: number) =>
  (acc: number, cur: number): number =>
    acc + cur / count;

/**
 * BPMを計算する
 * @param dateList 記録された時間のリスト
 */
export const calculateBpm: (dateList: Date[]) => {
  value: number | null;
  sd: number | null;
} = (dateList) => {
  // 閾値以内に記録されたデータだけ使う
  const now = new Date();
  const past = new Date(now.getTime() - MAX_PAST_TIME);
  const filteredDateList = dateList.filter(
    (date) => date.getTime() > past.getTime()
  );

  // 差分を計算
  const filteredDiffList: number[] = filteredDateList
    .reduce<number[]>((acc, cur, idx, arr) => {
      if (idx > 0) {
        acc.push(cur.getTime() - arr[idx - 1].getTime());
      }
      return acc;
    }, [])
    // 一定の秒数以上の差分は考慮しない
    .filter((diff) => diff < DIFF_THRESHOLD);

  // 必要数のデータがない場合は null を返す
  if (filteredDiffList.length < 1) return emptyReturn;

  // 差分の平均値を単純移動平均で計算
  const average = filteredDiffList.reduce(
    simpleMovingAverageHandler(filteredDiffList.length),
    0
  );

  const σ = calculateStandardDeviation(filteredDiffList);
  const bpm = 60000 / average;

  // 第一段階の計算結果
  const tmpReturn = {
    value: bpm,
    sd: σ,
  };

  // サンプル数が少ないときはそのまま返す
  if (filteredDiffList.length < 10) return tmpReturn;

  // 標準偏差がわかったところで、平均から σ 以内のデータだけを使う
  const filteredDiffList2 = filteredDiffList.filter(
    (diff) => Math.abs(diff - average) < σ
  );

  // データが減りすぎの時は第一段階の計算結果を返す
  if (filteredDiffList2.length < 8) return tmpReturn;

  // 改めて平均値を計算
  const average2 = filteredDiffList2.reduce(
    simpleMovingAverageHandler(filteredDiffList2.length),
    0
  );

  // 改めて標準偏差を計算
  const sd = calculateStandardDeviation(filteredDiffList2);

  // BPMを計算
  const bpm2 = 60000 / average2;
  return {
    value: bpm2,
    sd,
  };
};

const emptyReturn = {
  value: null,
  sd: null,
};

/**
 * 分散を計算する
 *
 * @param list
 * @returns variance
 */
const calculateVariance = (list: number[]) => {
  const average = list.reduce((acc, cur) => acc + cur, 0) / list.length;
  return list.reduce((acc, cur) => acc + (cur - average) ** 2, 0) / list.length;
};

/**
 * 標準偏差を計算する
 *
 * @param list
 * @returns
 */
const calculateStandardDeviation = (list: number[]) => {
  return Math.sqrt(calculateVariance(list));
};
