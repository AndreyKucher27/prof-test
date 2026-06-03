import type {
  InterestKey,
  InterestProfile,
} from "../types/interest";

type InterestRule = {
  key: InterestKey;

  name: string;

  questionIndexes: number[];
};

const interestRules: InterestRule[] = [
  {
    key: "math",

    name: "Математика",

    questionIndexes: [0, 1, 6],
  },

  {
    key: "modeling",

    name: "Моделирование",

    questionIndexes: [0, 4, 10],
  },

  {
    key: "development",

    name: "Разработка ПО",

    questionIndexes: [2, 3, 8],
  },

  {
    key: "systems",

    name: "Системы и инфраструктура",

    questionIndexes: [5, 8, 10],
  },

  {
    key: "data",

    name: "Анализ данных",

    questionIndexes: [4, 6, 9],
  },

  {
    key: "ai",

    name: "Искусственный интеллект",

    questionIndexes: [6, 9, 11],
  },

  {
    key: "vision",

    name: "Компьютерное зрение",

    questionIndexes: [6, 11],
  },

  {
    key: "business",

    name: "Бизнес и цифровые решения",

    questionIndexes: [4, 7],
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

export function calculateInterestProfile(
  answers: number[]
): InterestProfile[] {
  return interestRules.map((rule) => {
    const total =
      rule.questionIndexes.reduce(
        (sum, questionIndex) => {
          return (
            sum +
            answers[questionIndex]
          );
        },
        0
      );

    const max =
      rule.questionIndexes.length * 10;

    const percent = Math.round(
      (total / max) * 100
    );

    return {
      key: rule.key,

      name: rule.name,

      percent,
    };
  });
}