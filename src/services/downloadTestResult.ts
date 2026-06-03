import type { Result } from "../types/result";
import type { InterestProfile } from "../types/interest";

type EducationLevel = "bachelor" | "master";

type DownloadTestResultParams = {
  educationLevel: EducationLevel;
  answers: number[];
  results: Result[];
  interestProfile: InterestProfile[];
};

function formatEducationLevel(level: EducationLevel): string {
  return level === "bachelor" ? "Бакалавриат" : "Магистратура";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createList(items: string[], emptyText: string): string {
  if (items.length === 0) {
    return `<li>${escapeHtml(emptyText)}</li>`;
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function downloadTestResult({
  educationLevel,
  answers,
  results,
  interestProfile,
}: DownloadTestResultParams) {
  const currentDate = new Date().toLocaleString("ru-RU");

  const bestResult = results[0];

  const resultsHtml = results
    .map((result, index) => {
      return `
        <section class="result-card ${index === 0 ? "best-card" : ""}">
          <div class="result-top">
            <div>
              <span class="result-rank">#${index + 1}</span>
              <h2>${escapeHtml(result.name)}</h2>
            </div>

            <div class="percent">${result.percent}%</div>
          </div>

          <div class="bar">
            <div class="bar-fill" style="width: ${result.percent}%"></div>
          </div>

          <p class="description">${escapeHtml(result.description)}</p>

          <div class="details">
            <div class="detail-box">
              <h3>Почему подходит</h3>
              <ul>
                ${createList(result.reasons, "Причины не указаны")}
              </ul>
            </div>

            <div class="detail-box warning-box">
              <h3>На что обратить внимание</h3>
              <ul>
                ${createList(
                  result.warnings,
                  "Существенных предупреждений нет"
                )}
              </ul>
            </div>
          </div>
        </section>
      `;
    })
    .join("");

  const interestHtml = interestProfile
    .map((interest) => {
      return `
        <div class="interest-row">
          <div class="interest-top">
            <span>${escapeHtml(interest.name)}</span>
            <strong>${interest.percent}%</strong>
          </div>

          <div class="bar small">
            <div class="bar-fill" style="width: ${interest.percent}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const answersHtml = answers
    .map((answer, index) => {
      return `
        <div class="answer-chip">
          <span>Вопрос ${index + 1}</span>
          <strong>${answer}</strong>
        </div>
      `;
    })
    .join("");

  const html = `
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Результат профориентационного теста</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Inter, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 40px 20px;
    }

    .page {
      max-width: 920px;
      margin: 0 auto;
      background: white;
      border-radius: 28px;
      padding: 42px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 36px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 16px;
      margin-bottom: 18px;
      border-radius: 999px;
      background: #eff6ff;
      color: #2563eb;
      font-size: 13px;
      font-weight: 900;
    }

    h1 {
      font-size: 38px;
      line-height: 1.1;
      margin-bottom: 14px;
      letter-spacing: -0.03em;
    }

    .subtitle {
      color: #64748b;
      font-size: 17px;
      line-height: 1.55;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 30px;
    }

    .meta-card {
      padding: 18px;
      border-radius: 18px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      text-align: center;
    }

    .meta-card span {
      display: block;
      margin-bottom: 6px;
      color: #64748b;
      font-size: 13px;
      font-weight: 800;
    }

    .meta-card strong {
      color: #2563eb;
      font-size: 20px;
      font-weight: 900;
    }

    .best-summary {
      margin-bottom: 30px;
      padding: 28px;
      border-radius: 24px;
      background: linear-gradient(135deg, #eff6ff, #ffffff);
      border: 1px solid #bfdbfe;
      text-align: center;
    }

    .best-summary .best-label {
      display: inline-flex;
      padding: 8px 15px;
      margin-bottom: 16px;
      border-radius: 999px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: white;
      font-size: 13px;
      font-weight: 900;
    }

    .best-summary h2 {
      font-size: 26px;
      line-height: 1.25;
      margin-bottom: 12px;
    }

    .best-summary p {
      color: #475569;
      line-height: 1.55;
    }

    .section {
      margin-top: 34px;
    }

    .section-title {
      margin-bottom: 18px;
      font-size: 24px;
      letter-spacing: -0.02em;
    }

    .result-card {
      padding: 24px;
      margin-bottom: 18px;
      border-radius: 22px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }

    .best-card {
      border-color: #2563eb;
      background: linear-gradient(135deg, #eff6ff, #f5f3ff);
    }

    .result-top {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .result-rank {
      display: inline-flex;
      padding: 6px 10px;
      margin-bottom: 10px;
      border-radius: 999px;
      background: #2563eb;
      color: white;
      font-size: 12px;
      font-weight: 900;
    }

    .result-card h2 {
      font-size: 21px;
      line-height: 1.25;
    }

    .percent {
      min-width: 76px;
      padding: 10px 14px;
      border-radius: 999px;
      background: #2563eb;
      color: white;
      text-align: center;
      font-size: 18px;
      font-weight: 900;
    }

    .bar {
      width: 100%;
      height: 12px;
      margin-bottom: 16px;
      border-radius: 999px;
      background: #dbeafe;
      overflow: hidden;
    }

    .bar.small {
      height: 8px;
      margin-bottom: 0;
    }

    .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #2563eb, #7c3aed);
    }

    .description {
      margin-bottom: 18px;
      color: #475569;
      line-height: 1.55;
    }

    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .detail-box {
      padding: 16px;
      border-radius: 16px;
      background: white;
      border: 1px solid #e5e7eb;
    }

    .warning-box {
      background: #fff7ed;
      border-color: #fed7aa;
    }

    .detail-box h3 {
      margin-bottom: 10px;
      font-size: 15px;
    }

    .detail-box ul {
      padding-left: 18px;
    }

    .detail-box li {
      margin-bottom: 6px;
      color: #475569;
      line-height: 1.45;
      font-size: 14px;
    }

    .warning-box li,
    .warning-box h3 {
      color: #7c2d12;
    }

    .interest-list {
      display: grid;
      gap: 14px;
    }

    .interest-row {
      padding: 16px;
      border-radius: 16px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }

    .interest-top {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 8px;
      font-weight: 800;
    }

    .answers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .answer-chip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }

    .answer-chip span {
      color: #64748b;
      font-size: 13px;
      font-weight: 800;
    }

    .answer-chip strong {
      color: #2563eb;
      font-size: 18px;
      font-weight: 900;
    }

    .footer {
      margin-top: 38px;
      padding-top: 22px;
      border-top: 1px solid #e5e7eb;
      color: #94a3b8;
      font-size: 13px;
      text-align: center;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .page {
        box-shadow: none;
        border: none;
      }
    }

    @media (max-width: 720px) {
      .page {
        padding: 28px;
      }

      .meta,
      .details {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 30px;
      }

      .result-top {
        flex-direction: column;
      }
    }
  </style>
</head>

<body>
  <main class="page">
    <header class="header">
      <div class="badge">ФКТиПМ · Профориентационный тест</div>

      <h1>Результат профориентационного теста</h1>

      <p class="subtitle">
        Отчёт сформирован на основе ответов пользователя и сравнения профиля
        интересов с характеристиками образовательных программ.
      </p>
    </header>

    <section class="meta">
      <div class="meta-card">
        <span>Дата прохождения</span>
        <strong>${escapeHtml(currentDate)}</strong>
      </div>

      <div class="meta-card">
        <span>Уровень поступления</span>
        <strong>${formatEducationLevel(educationLevel)}</strong>
      </div>
    </section>

    ${
      bestResult
        ? `
          <section class="best-summary">
            <div class="best-label">★ Лучшее совпадение</div>
            <h2>${escapeHtml(bestResult.name)}</h2>
            <p>${escapeHtml(bestResult.description)}</p>
          </section>
        `
        : ""
    }

    <section class="section">
      <h2 class="section-title">Топ-3 рекомендации</h2>
      ${resultsHtml}
    </section>

    <section class="section">
      <h2 class="section-title">Профиль интересов</h2>
      <div class="interest-list">
        ${interestHtml}
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Ответы пользователя</h2>
      <div class="answers-grid">
        ${answersHtml}
      </div>
    </section>

    <footer class="footer">
      Отчёт сформирован автоматически рекомендательной системой.
    </footer>
  </main>
</body>
</html>
`;

  const blob = new Blob([html], {
    type: "text/html;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `career-test-result-${Date.now()}.html`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}