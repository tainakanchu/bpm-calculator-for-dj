import BigNumber from "bignumber.js";

export type BpmStatisticInfo = {
  value: BigNumber;
  sd: BigNumber;
};

export type EmptyBpmStatisticInfo = {
  value: undefined;
  sd: undefined;
};

export type BpmStatisticInfoOrEmpty = BpmStatisticInfo | EmptyBpmStatisticInfo;
