import { supabase } from "../lib/supabase";

import type { Result } from "../types/result";
import type { InterestProfile } from "../types/interest";

export type AdminTestResult = {
  id: string;
  education_level: "bachelor" | "master";
  answers: number[];
  results: Result[];
  interest_profile: InterestProfile[];
  top_program_name: string | null;
  top_program_percent: number | null;
  created_at: string;
};

export async function getAdminResults(): Promise<AdminTestResult[]> {
  const { data, error } = await supabase
    .from("test_results")
    .select(
      "id, education_level, answers, results, interest_profile, top_program_name, top_program_percent, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Ошибка загрузки результатов:", error);
    return [];
  }

  return (data ?? []) as AdminTestResult[];
}