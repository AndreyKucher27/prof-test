import { supabase } from "../lib/supabase";

import type { Result } from "../types/result";
import type { InterestKey, InterestProfile } from "../types/interest";

type EducationLevel = "bachelor" | "master";

type SaveTestResultParams = {
  educationLevel: EducationLevel;
  answers: number[];
  results: Result[];
  interestProfile: InterestProfile[];
};

const interestKeys: InterestKey[] = [
  "math",
  "modeling",
  "development",
  "systems",
  "data",
  "ai",
  "vision",
  "business",
  "research",
  "product",
];

function isValidEducationLevel(value: unknown): value is EducationLevel {
  return value === "bachelor" || value === "master";
}

function isValidPercent(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function isValidAnswers(answers: unknown): answers is number[] {
  return (
    Array.isArray(answers) &&
    answers.length === 12 &&
    answers.every((answer) => {
      return (
        typeof answer === "number" &&
        Number.isInteger(answer) &&
        answer >= 0 &&
        answer <= 10
      );
    })
  );
}

function isValidStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function isValidProgramVector(
  value: unknown
): value is Record<InterestKey, number> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const vector = value as Record<InterestKey, unknown>;

  return interestKeys.every((key) => isValidPercent(vector[key]));
}

function isValidInterestProfile(
  interestProfile: unknown
): interestProfile is InterestProfile[] {
  return (
    Array.isArray(interestProfile) &&
    interestProfile.length === interestKeys.length &&
    interestProfile.every((interest) => {
      return (
        interest &&
        typeof interest === "object" &&
        interestKeys.includes((interest as InterestProfile).key) &&
        typeof (interest as InterestProfile).name === "string" &&
        isValidPercent((interest as InterestProfile).percent)
      );
    })
  );
}

function isValidResults(results: unknown): results is Result[] {
  return (
    Array.isArray(results) &&
    results.length > 0 &&
    results.length <= 3 &&
    results.every((result) => {
      return (
        result &&
        typeof result === "object" &&
        typeof (result as Result).name === "string" &&
        typeof (result as Result).description === "string" &&
        isValidPercent((result as Result).percent) &&
        isValidStringArray((result as Result).reasons) &&
        isValidStringArray((result as Result).warnings) &&
        isValidProgramVector((result as Result).programVector)
      );
    })
  );
}

function isValidTestResultData({
  educationLevel,
  answers,
  results,
  interestProfile,
}: SaveTestResultParams): boolean {
  return (
    isValidEducationLevel(educationLevel) &&
    isValidAnswers(answers) &&
    isValidResults(results) &&
    isValidInterestProfile(interestProfile)
  );
}

export async function saveTestResult({
  educationLevel,
  answers,
  results,
  interestProfile,
}: SaveTestResultParams): Promise<string | null> {
  if (
    !isValidTestResultData({
      educationLevel,
      answers,
      results,
      interestProfile,
    })
  ) {
    console.error("Некорректные данные результата теста:", {
      educationLevel,
      answers,
      results,
      interestProfile,
    });

    return null;
  }

  const bestResult = results[0];

  const { error } = await supabase.from("test_results").insert({
    education_level: educationLevel,
    answers,
    results,
    interest_profile: interestProfile,
    top_program_name: bestResult.name,
    top_program_percent: bestResult.percent,
  });

  if (error) {
    console.error("Ошибка сохранения результата:", error);
    return null;
  }

  console.log("Результат успешно сохранён в Supabase");

  return "saved";
}