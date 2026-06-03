type EducationLevelScreenProps = {
  onSelect: (level: "bachelor" | "master") => void;
};

function EducationLevelScreen({ onSelect }: EducationLevelScreenProps) {
  return (
    <div className="container level-screen">
      <div className="hero-badge">ФКТиПМ</div>

      <h1 className="hero-title">Профориентационная система</h1>

      <p className="hero-subtitle">
        Выберите уровень поступления, пройдите короткий тест и получите
        персональные рекомендации по образовательным программам факультета.
      </p>

      <div className="level-cards">
        <button
          className="level-card bachelor-card"
          onClick={() => onSelect("bachelor")}
        >
          <div className="level-card-header">
            <div className="level-icon">Б</div>
            <div className="level-tag">после школы / СПО</div>
          </div>

          <h2>Бакалавриат</h2>

          <p>
            Подбор направления для тех, кто выбирает первую образовательную
            траекторию в сфере IT, математики, данных и искусственного
            интеллекта.
          </p>

          <div className="level-meta">
            <span>5 направлений</span>
            <span>13 профилей</span>
            <span>12 вопросов</span>
          </div>
        </button>

        <button
          className="level-card master-card"
          onClick={() => onSelect("master")}
        >
          <div className="level-card-header">
            <div className="level-icon">М</div>
            <div className="level-tag">после бакалавриата</div>
          </div>

          <h2>Магистратура</h2>

          <p>
            Подбор программы для дальнейшей специализации: AI, моделирование,
            интеллектуальные системы, программные технологии и цифровая
            экономика.
          </p>

          <div className="level-meta">
            <span>3 направления</span>
            <span>5 профилей</span>
            <span>12 вопросов</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default EducationLevelScreen;