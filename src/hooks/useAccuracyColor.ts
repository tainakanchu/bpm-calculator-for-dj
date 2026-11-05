export const useAccuracyColor = (sd: number): string => {
  if (sd < 30) {
    return 'text-green-500';
  } else if (sd < 35) {
    return 'text-green-400';
  } else if (sd < 40) {
    return 'text-green-300';
  } else if (sd < 45) {
    return 'text-yellow-200';
  } else if (sd < 50) {
    return 'text-yellow-100';
  } else if (sd < 55) {
    return 'text-red-100';
  } else if (sd < 60) {
    return 'text-red-200';
  } else if (sd < 65) {
    return 'text-red-300';
  } else if (sd < 70) {
    return 'text-red-400';
  } else {
    return 'text-red-500';
  }
};
