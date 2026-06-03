type QuestionScreenProps = {
  question: string;
  currentAnswer: number;
  currentQuestion: number;
  totalQuestions: number;
  progress: number;

  onAnswerChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
};

function QuestionScreen({
  question,
  currentAnswer,
  currentQuestion,
  totalQuestions,
  progress,
  onAnswerChange,
  onNext,
  onPrev,
  onFinish,
}: QuestionScreenProps) {
  return (
    <div className="container">
      <h1 className="title">
        Профориентационный тест ФКТиПМ
      </h1>

      <div className="progress-info">
        <span>
          Вопрос {currentQuestion + 1} из{" "}
          {totalQuestions}
        </span>

        <span>{Math.round(progress)}%</span>
      </div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="question-card">
        <h2 className="question">{question}</h2>

        <div className="answer-value">
          {currentAnswer}
        </div>

        <input
          type="range"
          min="0"
          max="10"
          value={currentAnswer}
          className="slider"
          onChange={(event) =>
            onAnswerChange(
              Number(event.target.value)
            )
          }
        />

        <div className="scale">
          <span>0 — совсем не про меня</span>

          <span>10 — точно про меня</span>
        </div>
      </div>

      <div className="buttons">
        <button
          className="button secondary"
          onClick={onPrev}
          disabled={currentQuestion === 0}
        >
          Назад
        </button>

        {currentQuestion === totalQuestions - 1 ? (
          <button
            className="button"
            onClick={onFinish}
          >
            Показать результат
          </button>
        ) : (
          <button
            className="button"
            onClick={onNext}
          >
            Следующий вопрос
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionScreen;