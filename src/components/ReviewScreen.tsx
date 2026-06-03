type ReviewScreenProps = {
  questions: string[];
  answers: number[];
  onBack: () => void;
  onShowResults: () => void;
};

function ReviewScreen({
  questions,
  answers,
  onBack,
  onShowResults,
}: ReviewScreenProps) {
  return (
    <div className="container review-screen">
      <div className="screen-header results-header">
  <div className="badge">Проверка ответов</div>

  <h1 className="title">Проверьте ваши ответы</h1>

  <p className="subtitle">
    Перед расчётом рекомендаций убедитесь, что оценки отражают ваши
    реальные интересы и предпочтения.
  </p>
</div>

      <div className="review-summary-card">
        <div>
          <span className="review-summary-label">Всего утверждений</span>
          <strong>{questions.length}</strong>
        </div>

        <div>
          <span className="review-summary-label">Средняя оценка</span>
          <strong>
            {Math.round(
              answers.reduce((sum, answer) => sum + answer, 0) /
                answers.length
            )}
            /10
          </strong>
        </div>
      </div>

      <div className="review-list">
        {questions.map((question, index) => {
          const answer = answers[index];

          return (
            <div className="review-item" key={question}>
              <div className="review-content">
                <span className="review-number">Утверждение {index + 1}</span>

                <p className="review-question">{question}</p>

                <div className="review-mini-bar">
                  <div
                    className="review-mini-bar-fill"
                    style={{ width: `${answer * 10}%` }}
                  />
                </div>
              </div>

<div className="review-answer">
  <strong>{answer}</strong>
</div>
            </div>
          );
        })}
      </div>

      <div className="buttons screen-actions">
<button type="button" className="button secondary" onClick={onBack}>
  ← Вернуться к вопросам
</button>

<button type="button" className="button" onClick={onShowResults}>
  Показать результат →
</button>
      </div>
    </div>
  );
}

export default ReviewScreen;