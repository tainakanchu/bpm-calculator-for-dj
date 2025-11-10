declare module "web-audio-beat-detector" {
  export type GuessOptions = {
    minTempo?: number;
    maxTempo?: number;
  };

  export type GuessResult = {
    bpm: number;
    offset: number;
  };

  export function guess(audioBuffer: AudioBuffer, options?: GuessOptions): Promise<GuessResult>;
}
