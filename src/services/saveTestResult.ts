import { supabase } from "../lib/supabase";

import type { Result } from "../types/result";
import type { InterestProfile } from "../types/interest";

type EducationLevel = "bachelor" | "master";

type SaveTestResultParams = {
  educationLevel: EducationLevel;
  answers: number[];
  results: Result[];
  interestProfile: InterestProfile[];
};

export async function saveTestResult({
  educationLevel,
  answers,
  results,
  interestProfile,
}: SaveTestResultParams): Promise<string | null> {
  const bestResult = results[0];

  const { error } = await supabase.from("test_results").insert({
    education_level: educationLevel,
    answers,
    results,
    interest_profile: interestProfile,
    top_program_name: bestResult?.name ?? null,
    top_program_percent: bestResult?.percent ?? null,
  });

  if (error) {
    console.error("Ошибка сохранения результата:", error);
    return null;
  }

  console.log("Результат успешно сохранён в Supabase");

  return "saved";
}