export const useAccuracyColor = (sd: number): string => {
  if (sd < 30) {
    return 'text-green-500';
  }
  if (sd < 35) {
    return 'text-green-400';
  }
  if (sd < 40) {
    return 'text-green-300';
  }
  if (sd < 45) {
    return 'text-yellow-200';
  }
  if (sd < 50) {
    return 'text-yellow-100';
  }
  if (sd < 55) {
    return 'text-red-100';
  }
  if (sd < 60) {
    return 'text-red-200';
  }
  if (sd < 65) {
    return 'text-red-300';
  }
  if (sd < 70) {
    return 'text-red-400';
  }
  return 'text-red-500';
};
