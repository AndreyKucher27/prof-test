import type { InterestKey } from "./interest";

export type Result = {
  name: string;
  description: string;
  percent: number;
  reasons: string[];
  warnings: string[];
  programVector: Record<InterestKey, number>;
};