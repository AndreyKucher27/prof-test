export type InterestKey =
  | "math"
  | "modeling"
  | "development"
  | "systems"
  | "data"
  | "ai"
  | "vision"
  | "business"
  | "research"
  | "product";

export type InterestProfile = {
  key: InterestKey;
  name: string;
  percent: number;
};