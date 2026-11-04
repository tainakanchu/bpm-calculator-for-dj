import BigNumber from 'bignumber.js';

import type { BpmStatisticInfo, BpmStatisticInfoOrEmpty, EmptyBpmStatisticInfo } from '../types';

// データとして使用する最大の過去時間
const MAX_PAST_TIME = 20 * 1000;

// これ以上の間隔が空いたら新しい計測を始める
const DIFF_THRESHOLD = 3000;
const MIN_DIFF = 100;

const simpleMovingAverageHandler =
  (count: number) =>
  (acc: BigNumber, cur: BigNumber): BigNumber =>
    cur.div(count).plus(acc);

/**
 * BPMを計算する
 * @param dateList 記録された時間のリスト
 */
export const calculateBpm: (dateList: Date[]) => BpmStatisticInfoOrEmpty = (dateList) => {
  const now = new Date();
  const past = new Date(now.getTime() - MAX_PAST_TIME);
  const filteredDateList = dateList.filter((date) => date.getTime() > past.getTime());

  const filteredDiffList: BigNumber[] = filteredDateList
    .reduce<number[]>((acc, cur, idx, arr) => {
      if (idx > 0) {
        const diff = cur.getTime() - arr[idx - 1].getTime();
        if (diff >= DIFF_THRESHOLD) return [];
        if (diff >= MIN_DIFF) return [...acc, diff];
      }
      return acc;
    }, [])
    .map((diff) => new BigNumber(diff));
  if (filteredDiffList.length < 1) return emptyReturn;

  const average = filteredDiffList.reduce(
    simpleMovingAverageHandler(filteredDiffList.length),
    new BigNumber(0),
  );

  const σ = calculateStandardDeviation(filteredDiffList);
  const bpm = new BigNumber(60000).div(average);

  const tmpReturn: BpmStatisticInfo = {
    value: bpm,
    sd: σ,
  };

  // サンプル数が少ないときはそのまま返す
  if (filteredDiffList.length < 10) return tmpReturn;

  // 標準偏差がわかったところで、平均から σ 以内のデータだけを使う
  const filteredDiffList2 = filteredDiffList.filter((diff) => diff.minus(average).abs().lt(σ));

  const average2 = filteredDiffList2.reduce(
    simpleMovingAverageHandler(filteredDiffList2.length),
    new BigNumber(0),
  );

  if (average2.isZero()) return tmpReturn;

  const sd = calculateStandardDeviation(filteredDiffList2);

  const bpm2 = new BigNumber(60000).div(average2);
  return {
    value: bpm2,
    sd,
    sampleSize: filteredDiffList2.length,
  };
};

const emptyReturn: EmptyBpmStatisticInfo = {
  value: undefined,
  sd: undefined,
};

/**
 * 分散を計算する
 *
 * @param list
 * @returns variance
 */
const calculateVariance = (list: BigNumber[]) => {
  const average = list.reduce((acc, cur) => acc.plus(cur), new BigNumber(0)).div(list.length);
  return list
    .reduce((acc, cur) => acc.plus(cur.minus(average).pow(2)), new BigNumber(0))
    .div(list.length);
};

/**
 * 標準偏差を計算する
 *
 * @param list
 * @returns
 */
const calculateStandardDeviation = (list: BigNumber[]) => {
  return calculateVariance(list).sqrt();
};
