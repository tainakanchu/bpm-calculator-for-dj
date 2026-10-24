import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateBpm } from './calculateBpm';

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();

/**
 * 最後のタップを「現在時刻」として、与えた間隔(ms)でタップした時刻列を作る。
 */
const tapsFromIntervals = (intervals: number[], endAt = NOW): Date[] => {
  const total = intervals.reduce((acc, cur) => acc + cur, 0);
  let t = endAt - total;
  const dates = [new Date(t)];
  for (const interval of intervals) {
    t += interval;
    dates.push(new Date(t));
  }
  return dates;
};

describe('calculateBpm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('タップが無いときは空の結果を返す', () => {
    const result = calculateBpm([]);
    expect(result.value).toBeUndefined();
    expect(result.sd).toBeUndefined();
  });

  it('タップが 1 回だけでは間隔が無いので空の結果を返す', () => {
    const result = calculateBpm([new Date(NOW)]);
    expect(result.value).toBeUndefined();
    expect(result.sd).toBeUndefined();
  });

  it('500ms 間隔のタップは 120 BPM・標準偏差 0 になる', () => {
    const result = calculateBpm(tapsFromIntervals([500, 500, 500, 500]));
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(0);
  });

  it('BPM は平均間隔から計算され、標準偏差は母標準偏差になる', () => {
    // 平均 500ms → 120 BPM、偏差 ±100ms → σ = 100
    const result = calculateBpm(tapsFromIntervals([400, 600]));
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(100);
  });

  it('割り切れない BPM も高精度に計算する', () => {
    // 平均 700ms → 60000 / 700 = 85.714285...
    const result = calculateBpm(tapsFromIntervals([700, 700]));
    expect(result.value?.toFixed(1)).toBe('85.7');
    expect(result.value?.toNumber()).toBeCloseTo(60000 / 700, 10);
  });

  it('3000ms 以上空いた間隔は計算に使わない', () => {
    // 3500ms と、ちょうど 3000ms の間隔は除外される
    const result = calculateBpm(tapsFromIntervals([500, 3500, 500, 3000, 500]));
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(0);
  });

  it('有効な間隔が全て 3000ms 以上なら空の結果を返す', () => {
    const result = calculateBpm(tapsFromIntervals([3000, 5000]));
    expect(result.value).toBeUndefined();
    expect(result.sd).toBeUndefined();
  });

  it('20 秒より前のタップは計算に使わない', () => {
    const old = [new Date(NOW - 25_000), new Date(NOW - 24_000)];
    // ちょうど 20 秒前のタップも除外される（それより新しいものだけを使う）
    const boundary = [new Date(NOW - 20_000)];
    const recent = tapsFromIntervals([500, 500]);
    const result = calculateBpm([...old, ...boundary, ...recent]);
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(0);
  });

  it('全てのタップが 20 秒より前なら空の結果を返す', () => {
    const result = calculateBpm(tapsFromIntervals([500, 500], NOW - 30_000));
    expect(result.value).toBeUndefined();
  });

  it('サンプルが 10 未満のときは外れ値を除外しない', () => {
    // 500ms × 8 + 1000ms × 1 → 平均 5000/9 ms
    const intervals = [...Array<number>(8).fill(500), 1000];
    const result = calculateBpm(tapsFromIntervals(intervals));
    expect(result.value?.toNumber()).toBeCloseTo(60000 / (5000 / 9), 10);
    expect(result).not.toHaveProperty('sampleSize');
  });

  it('サンプルが 10 以上のときは平均から σ 以上離れた間隔を除外して再計算する', () => {
    // 500ms × 9 + 1000ms × 1 → 平均 550ms, σ = 150ms
    // |1000 - 550| = 450 >= σ なので除外され、残りの平均は 500ms
    const intervals = [...Array<number>(9).fill(500), 1000];
    const result = calculateBpm(tapsFromIntervals(intervals));
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(0);
    expect(result).toHaveProperty('sampleSize', 9);
  });

  it('外れ値除外後の標準偏差を返す', () => {
    // 450/550ms の揺らぎ（平均 500ms, σ = 50ms）+ 1500ms の外れ値
    const intervals = [450, 550, 450, 550, 450, 550, 450, 550, 450, 550, 1500];
    const result = calculateBpm(tapsFromIntervals(intervals));
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(50);
    expect(result).toHaveProperty('sampleSize', 10);
  });

  it('サンプルが 10 以上で全て同じ間隔（σ = 0）のときは第一段階の結果を返す', () => {
    const result = calculateBpm(tapsFromIntervals(Array<number>(12).fill(500)));
    expect(result.value?.toNumber()).toBe(120);
    expect(result.sd?.toNumber()).toBe(0);
    expect(result).not.toHaveProperty('sampleSize');
  });

  it('入力の配列を変更しない', () => {
    const taps = tapsFromIntervals([500, 500, 500]);
    const snapshot = taps.map((d) => d.getTime());
    calculateBpm(taps);
    expect(taps.map((d) => d.getTime())).toEqual(snapshot);
  });
});
