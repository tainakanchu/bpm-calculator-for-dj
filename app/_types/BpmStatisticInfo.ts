export type BpmStatisticInfo = {
  value: number;
  sd: number;
};

export type EmptyBpmStatisticInfo = {
  value: undefined;
  sd: undefined;
};

export type BpmStatisticInfoOrEmpty = BpmStatisticInfo | EmptyBpmStatisticInfo;
