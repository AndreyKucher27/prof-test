import type { Program } from "../types/program";
import type { Result } from "../types/result";
import type { InterestKey } from "../types/interest";
import type { ProgramVector } from "../types/programVector";

import {
  calculateInterestProfile,
  type EducationLevel,
} from "./calculateInterestProfile";

const interestNames: Record<InterestKey, string> = {
  math: "математике",
  modeling: "моделированию",
  development: "разработке программного обеспечения",
  systems: "системам и инфраструктуре",
  data: "анализу данных",
  ai: "искусственному интеллекту",
  vision: "компьютерному зрению",
  business: "бизнесу и прикладным цифровым решениям",
  research: "исследовательской деятельности",
  product: "продуктовому мышлению",
};

const warningTexts: Record<InterestKey, string> = {
  math:
    "в программе важна математическая подготовка, поэтому стоит быть готовым к теоретическим дисциплинам",
  modeling:
    "направление связано с моделированием сложных процессов, поэтому потребуется интерес к формализации задач",
  development:
    "в программе важна разработка программных решений, поэтому желательно быть готовым к практическому программированию",
  systems:
    "направление затрагивает системы и инфраструктуру, поэтому может потребоваться интерес к устройству вычислительных систем",
  data:
    "в программе значимую роль играет анализ данных, поэтому стоит быть готовым к работе со статистикой и закономерностями",
  ai:
    "направление связано с искусственным интеллектом, поэтому потребуется интерес к алгоритмам, данным и моделям",
  vision:
    "в программе может встречаться компьютерное зрение и обработка изображений, что требует интереса к визуальным данным",
  business:
    "направление связано с прикладными и бизнес-задачами, поэтому важно учитывать предметный контекст",
  research:
    "в программе заметна исследовательская составляющая, поэтому стоит быть готовым к самостоятельному изучению и поиску решений",
  product:
    "направление ориентировано на создание решений и продуктов, поэтому важны практическое мышление и интерес к результату",
};

function calculateCosineSimilarity(
  userVector: Record<InterestKey, number>,
  programVector: Record<InterestKey, number>
): number {
  const keys = Object.keys(userVector) as InterestKey[];

  const dotProduct = keys.reduce((sum, key) => {
    return sum + userVector[key] * programVector[key];
  }, 0);

  const userMagnitude = Math.sqrt(
    keys.reduce((sum, key) => {
      return sum + userVector[key] ** 2;
    }, 0)
  );

  const programMagnitude = Math.sqrt(
    keys.reduce((sum, key) => {
      return sum + programVector[key] ** 2;
    }, 0)
  );

  if (userMagnitude === 0 || programMagnitude === 0) {
    return 0;
  }

  return (dotProduct / (userMagnitude * programMagnitude)) * 100;
}



function createUserVector(
  answers: number[],
  educationLevel: EducationLevel
): Record<InterestKey, number> {
  const interestProfile = calculateInterestProfile(answers, educationLevel);

  return interestProfile.reduce((vector, interest) => {
    vector[interest.key] = interest.percent;
    return vector;
  }, {} as Record<InterestKey, number>);
}

function getReasons(
  userVector: Record<InterestKey, number>,
  programVector: Record<InterestKey, number>
): string[] {
  const keys = Object.keys(userVector) as InterestKey[];

  const reasons = keys
    .filter((key) => userVector[key] >= 60 && programVector[key] >= 60)
    .sort((a, b) => {
      const scoreA = userVector[a] + programVector[a];
      const scoreB = userVector[b] + programVector[b];

      return scoreB - scoreA;
    })
    .map((key) => `у вас выражен интерес к ${interestNames[key]}`);

  if (reasons.length === 0) {
    return [
      "профиль частично совпадает с вашими интересами по результатам теста",
    ];
  }

  return reasons.slice(0, 4);
}

function getWarnings(
  userVector: Record<InterestKey, number>,
  programVector: Record<InterestKey, number>
): string[] {
  const keys = Object.keys(userVector) as InterestKey[];

  const warnings = keys
    .filter((key) => userVector[key] < 45 && programVector[key] > 70)
    .sort((a, b) => {
      const gapA = programVector[a] - userVector[a];
      const gapB = programVector[b] - userVector[b];

      return gapB - gapA;
    })
    .map((key) => warningTexts[key]);

  return warnings.slice(0, 3);
}

export function calculateResults(
  answers: number[],
  programs: Program[],
  programVectors: ProgramVector[],
  educationLevel: EducationLevel
): Result[] {
  const userVector = createUserVector(answers, educationLevel);

  const results = programs.map((program) => {
    const programVectorData = programVectors.find(
      (item) => item.name === program.name
    );

if (!programVectorData) {
  return {
    name: program.name,
    description: program.description,
    percent: 0,
    reasons: ["для этого профиля пока не задан вектор характеристик"],
    warnings: [],
    programVector: userVector,
  };
}

const percent = Math.round(
  calculateCosineSimilarity(userVector, programVectorData.vector)
);

return {
  name: program.name,
  description: program.description,
  percent,
  reasons: getReasons(userVector, programVectorData.vector),
  warnings: getWarnings(userVector, programVectorData.vector),
  programVector: programVectorData.vector,
};
  });

  return results.sort((a, b) => b.percent - a.percent).slice(0, 3);
}