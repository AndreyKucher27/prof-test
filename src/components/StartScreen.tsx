import { useRef, useState } from "react";

import type { Program } from "../types/program";

type EducationLevel = "bachelor" | "master";

type StartScreenProps = {
  questionsCount: number;
  programs: Program[];
  level: EducationLevel;
  onStart: () => void;
  onBack: () => void;
};

type Category = {
  title: string;
  shortTitle: string;
  match: string[];
  description: string;
  color: "blue" | "green" | "orange" | "purple" | "pink";
};

const bachelorCategories: Category[] = [
  {
    title: "Прикладная математика и информатика",
    shortTitle: "ПМИ",
    match: ["ПМИ"],
    description: "Моделирование, программные технологии и цифровая экономика.",
    color: "blue",
  },
  {
    title: "Прикладная информатика",
    shortTitle: "ПИ",
    match: ["ПИ —", "Прикладная информатика"],
    description:
      "Искусственный интеллект, машинное обучение и прикладные AI-системы.",
    color: "green",
  },
  {
    title:
      "Математическое обеспечение и администрирование информационных систем",
    shortTitle: "МОАИС",
    match: ["МОАИС"],
    description:
      "Разработка программных систем, аналитика данных и информационные системы.",
    color: "orange",
  },
  {
    title: "Фундаментальная информатика и информационные технологии",
    shortTitle: "ФИИТ",
    match: ["ФИИТ"],
    description: "Интеллектуальные системы, вычисления и фундаментальные ИТ.",
    color: "purple",
  },
  {
    title: "Программная инженерия",
    shortTitle: "ПИ",
    match: ["Программная инженерия"],
    description:
      "Проектирование, разработка и сопровождение программных продуктов.",
    color: "pink",
  },
];

const masterCategories: Category[] = [
  {
    title: "Прикладная математика и информатика",
    shortTitle: "ПМИ",
    match: ["ПМИ"],
    description:
      "Углублённая подготовка в области моделирования, ИИ и анализа данных.",
    color: "blue",
  },
  {
    title: "Прикладная информатика",
    shortTitle: "ПИ",
    match: ["ПИ —", "Прикладная информатика"],
    description:
      "AI-системы, аналитика данных и прикладные информационные решения.",
    color: "green",
  },
  {
    title: "Фундаментальная информатика и информационные технологии",
    shortTitle: "ФИИТ",
    match: ["ФИИТ"],
    description:
      "Интеллектуальные системы, вычисления и современные ИТ-методы.",
    color: "purple",
  },
];

function getProfileName(fullName: string) {
  const parts = fullName.split("—");

  return parts.length > 1 ? parts[1].trim() : fullName;
}

function getCategoryPrograms(programs: Program[], category: Category) {
  return programs.filter((program) =>
    category.match.some((keyword) => program.name.includes(keyword))
  );
}

function StartScreen({
  questionsCount,
  programs,
  level,
  onStart,
  onBack,
}: StartScreenProps) {
  const [openedCategory, setOpenedCategory] = useState<string | null>(null);

const profilesPanelRef = useRef<HTMLDivElement | null>(null);
const directionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const categories =
    level === "bachelor" ? bachelorCategories : masterCategories;

  const selectedCategory = categories.find(
    (category) => category.title === openedCategory
  );

  const selectedPrograms = selectedCategory
    ? getCategoryPrograms(programs, selectedCategory)
    : [];

const scrollToProfilesPanel = () => {
  window.setTimeout(() => {
    profilesPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 120);
};

const scrollToDirectionCard = (categoryTitle: string) => {
  window.setTimeout(() => {
    directionRefs.current[categoryTitle]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 120);
};

const toggleCategory = (categoryTitle: string) => {
  const isClosing = openedCategory === categoryTitle;

  setOpenedCategory(isClosing ? null : categoryTitle);

  if (isClosing) {
    scrollToDirectionCard(categoryTitle);
    return;
  }

  scrollToProfilesPanel();
};

const closeProfilesPanel = () => {
  const categoryTitle = openedCategory;

  setOpenedCategory(null);

  if (categoryTitle) {
    scrollToDirectionCard(categoryTitle);
  }
};

  return (
    <div className="container start-screen program-start-screen">
      <button type="button" className="back-link" onClick={onBack}>
        ← Назад к выбору уровня
      </button>

      <div className="screen-header">
        <div className="hero-badge">ФКТиПМ</div>

        <h1 className="hero-title">
          {level === "bachelor"
            ? "Выбор направления бакалавриата"
            : "Выбор программы магистратуры"}
        </h1>

        <p className="hero-subtitle">
          Ответьте на несколько утверждений, чтобы система сравнила ваш профиль
          интересов с образовательными программами факультета и предложила
          наиболее подходящие варианты.
        </p>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <strong>{categories.length}</strong>
          <span>направлений</span>
        </div>

        <div className="hero-stat">
          <strong>{programs.length}</strong>
          <span>профилей</span>
        </div>

        <div className="hero-stat">
          <strong>{questionsCount}</strong>
          <span>вопросов</span>
        </div>
      </div>

      <div className={`program-showcase ${openedCategory ? "with-panel" : ""}`}>
        <div className="direction-cards">
          {categories.map((category) => {
            const profilesCount = getCategoryPrograms(
              programs,
              category
            ).length;

            const isActive = openedCategory === category.title;

            return (
              <button
                type="button"
                ref={(element) => {
                  directionRefs.current[category.title] = element;
                }}
                className={`direction-card ${isActive ? "active" : ""}`}
                key={category.title}
                onClick={() => toggleCategory(category.title)}
              >
                <div className="direction-card-top">
                  <div className={`direction-icon ${category.color}`}>
                    {category.shortTitle}
                  </div>

                  <span>{profilesCount} проф.</span>
                </div>

                <h2>{category.title}</h2>

                <p>{category.description}</p>

                <div className="direction-action">
                  {isActive ? "Скрыть профили ↑" : "Посмотреть профили →"}
                </div>
              </button>
            );
          })}
        </div>

        {openedCategory && selectedCategory && (
          <div className="profiles-panel-modern" ref={profilesPanelRef}>
            <div className="profiles-panel-header">
              <div className="panel-title-group">
                <span className="panel-kicker">
                  {selectedPrograms.length}{" "}
                  {selectedPrograms.length === 1 ? "профиль" : "профиля"}
                </span>

                <h2>{selectedCategory.title}</h2>
              </div>

              <button
                type="button"
                className="panel-close"
                onClick={closeProfilesPanel}
                aria-label="Закрыть список профилей"
              >
                ×
              </button>
            </div>

            <div className="profiles-grid-modern">
              {selectedPrograms.length > 0 ? (
                selectedPrograms.map((program) => (
                  <div className="profile-card-modern" key={program.name}>
                    <h3>{getProfileName(program.name)}</h3>
                    <p>{program.description}</p>
                  </div>
                ))
              ) : (
                <div className="profile-card-modern">
                  <h3>Профили не найдены</h3>
                  <p>
                    Для выбранного направления пока не найдено связанных
                    профилей. Проверьте названия программ в файле с данными.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button type="button" className="button hero-button" onClick={onStart}>
        Пройти тест
      </button>
    </div>
  );
}

export default StartScreen;