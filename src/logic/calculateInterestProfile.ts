import type {
  InterestKey,
  InterestProfile,
} from "../types/interest";

export type EducationLevel = "bachelor" | "master";

type InterestRule = {
  key: InterestKey;

  name: string;

  questionIndexes: number[];
};

const bachelorInterestRules: InterestRule[] = [
  {
    key: "math",
    name: "Математика",
    questionIndexes: [0, 1],
  },
  {
    key: "modeling",
    name: "Моделирование",
    questionIndexes: [0, 1, 10],
  },
  {
    key: "development",
    name: "Разработка ПО",
    questionIndexes: [2, 3],
  },
  {
    key: "systems",
    name: "Системы и инфраструктура",
    questionIndexes: [4],
  },
  {
    key: "data",
    name: "Анализ данных",
    questionIndexes: [5, 11],
  },
  {
    key: "ai",
    name: "Искусственный интеллект",
    questionIndexes: [6, 9],
  },
  {
    key: "vision",
    name: "Компьютерное зрение",
    questionIndexes: [7],
  },
  {
    key: "business",
    name: "Бизнес и цифровые решения",
    questionIndexes: [8],
  },
  {
    key: "research",
    name: "Исследовательская деятельность",
    questionIndexes: [0, 1, 10],
  },
  {
    key: "product",
    name: "Продуктовое мышление",
    questionIndexes: [2, 3, 9, 11],
  },
];

const masterInterestRules: InterestRule[] = [
  {
    key: "math",
    name: "Математика",
    questionIndexes: [1, 2],
  },
  {
    key: "modeling",
    name: "Моделирование",
    questionIndexes: [1, 2],
  },
  {
    key: "development",
    name: "Разработка ПО",
    questionIndexes: [5],
  },
  {
    key: "systems",
    name: "Системы и инфраструктура",
    questionIndexes: [5, 6, 7, 9],
  },
  {
    key: "data",
    name: "Анализ данных",
    questionIndexes: [4, 8, 10],
  },
  {
    key: "ai",
    name: "Искусственный интеллект",
    questionIndexes: [3, 4, 8, 9],
  },
  {
    key: "vision",
    name: "Компьютерное зрение",
    questionIndexes: [4],
  },
  {
    key: "business",
    name: "Бизнес и цифровые решения",
    questionIndexes: [8],
  },
  {
    key: "research",
    name: "Исследовательская деятельность",
    questionIndexes: [0, 1, 2],
  },
  {
    key: "product",
    name: "Продуктовое мышление",
    questionIndexes: [5, 8, 9, 10],
  },
];

const interestRulesByLevel: Record<EducationLevel, InterestRule[]> = {
  bachelor: bachelorInterestRules,
  master: masterInterestRules,
};

export function calculateInterestProfile(
  answers: number[],
  educationLevel: EducationLevel = "bachelor"
): InterestProfile[] {
  const interestRules = interestRulesByLevel[educationLevel];

  return interestRules.map((rule) => {
    const total = rule.questionIndexes.reduce((sum, questionIndex) => {
      return sum + (answers[questionIndex] ?? 0);
    }, 0);

    const max = rule.questionIndexes.length * 10;

    const percent = Math.round((total / max) * 100);

    return {
      key: rule.key,
      name: rule.name,
      percent,
    };
  });
}