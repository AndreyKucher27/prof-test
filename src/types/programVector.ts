import type { InterestKey } from "./interest";

export type ProgramVector = {
  name: string;
  vector: Record<InterestKey, number>;
};