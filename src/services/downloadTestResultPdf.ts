import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import type { Result } from "../types/result";
import type { InterestProfile } from "../types/interest";

type EducationLevel = "bachelor" | "master";

type DownloadTestResultPdfParams = {
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

function createPdfReportElement({
  educationLevel,
  answers,
  results,
  interestProfile,
}: DownloadTestResultPdfParams): HTMLDivElement {
  const currentDate = new Date().toLocaleString("ru-RU");
  const bestResult = results[0];

  const resultsHtml = results
    .map((result, index) => {
      return `
        <section class="pdf-result-card ${index === 0 ? "pdf-best-card" : ""}">
          <div class="pdf-result-top">
            <div>
              <span class="pdf-rank">#${index + 1}</span>
              <h2>${escapeHtml(result.name)}</h2>
            </div>

            <div class="pdf-percent">${result.percent}%</div>
          </div>

          <div class="pdf-bar">
            <div class="pdf-bar-fill" style="width: ${result.percent}%"></div>
          </div>

          <p class="pdf-description">${escapeHtml(result.description)}</p>

          <div class="pdf-details">
            <div class="pdf-detail-box">
              <h3>Почему подходит</h3>
              <ul>
                ${createList(result.reasons, "Причины не указаны")}
              </ul>
            </div>

            <div class="pdf-detail-box pdf-warning-box">
              <h3>На что обратить внимание</h3>
              <ul>
                ${createList(result.warnings, "Существенных предупреждений нет")}
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
        <div class="pdf-interest-row">
          <div class="pdf-interest-top">
            <span>${escapeHtml(interest.name)}</span>
            <strong>${interest.percent}%</strong>
          </div>

          <div class="pdf-bar pdf-small-bar">
            <div class="pdf-bar-fill" style="width: ${interest.percent}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const answersHtml = answers
    .map((answer, index) => {
      return `
        <div class="pdf-answer-chip">
          <span>Вопрос ${index + 1}</span>
          <strong>${answer}</strong>
        </div>
      `;
    })
    .join("");

  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div class="pdf-page">
      <style>
        .pdf-page {
          width: 794px;
          padding: 42px;
          background:
            radial-gradient(circle at top left, #dbeafe, transparent 34%),
            radial-gradient(circle at bottom right, #ede9fe, transparent 34%),
            #f8fafc;
          color: #0f172a;
          font-family: Inter, Arial, sans-serif;
        }

        .pdf-document {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 42px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
        }

        .pdf-header {
          text-align: center;
          margin-bottom: 34px;
        }

        .pdf-badge {
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

        .pdf-header h1 {
          margin: 0 0 14px;
          font-size: 34px;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .pdf-subtitle {
          max-width: 620px;
          margin: 0 auto;
          color: #64748b;
          font-size: 16px;
          line-height: 1.55;
        }

        .pdf-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 28px;
        }

        .pdf-meta-card {
          padding: 18px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          text-align: center;
        }

        .pdf-meta-card span {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .pdf-meta-card strong {
          color: #2563eb;
          font-size: 18px;
          font-weight: 900;
        }

        .pdf-best-summary {
          margin-bottom: 30px;
          padding: 28px;
          border-radius: 24px;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 34%),
            linear-gradient(135deg, #eff6ff, #ffffff);
          border: 1px solid #bfdbfe;
          text-align: center;
        }

        .pdf-best-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 15px;
          margin-bottom: 16px;
          border-radius: 999px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          font-size: 13px;
          font-weight: 900;
        }

        .pdf-best-summary h2 {
          margin: 0 0 12px;
          font-size: 24px;
          line-height: 1.25;
          color: #0f172a;
        }

        .pdf-best-summary p {
          margin: 0;
          color: #475569;
          font-size: 15px;
          line-height: 1.55;
        }

        .pdf-section {
          margin-top: 32px;
        }

        .pdf-section-title {
          margin: 0 0 18px;
          font-size: 23px;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .pdf-result-card {
          padding: 22px;
          margin-bottom: 18px;
          border-radius: 22px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
        }

        .pdf-best-card {
          border-color: #2563eb;
          background: linear-gradient(135deg, #eff6ff, #f5f3ff);
        }

        .pdf-result-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .pdf-rank {
          display: inline-flex;
          padding: 6px 10px;
          margin-bottom: 10px;
          border-radius: 999px;
          background: #2563eb;
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .pdf-result-card h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1.25;
          color: #0f172a;
        }

        .pdf-percent {
          min-width: 74px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #2563eb;
          color: white;
          text-align: center;
          font-size: 18px;
          font-weight: 900;
        }

        .pdf-bar {
          width: 100%;
          height: 12px;
          margin-bottom: 16px;
          border-radius: 999px;
          background: #dbeafe;
          overflow: hidden;
        }

        .pdf-small-bar {
          height: 8px;
          margin-bottom: 0;
        }

        .pdf-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
        }

        .pdf-description {
          margin: 0 0 18px;
          color: #475569;
          font-size: 14px;
          line-height: 1.55;
        }

        .pdf-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .pdf-detail-box {
          padding: 16px;
          border-radius: 16px;
          background: white;
          border: 1px solid #e5e7eb;
        }

        .pdf-warning-box {
          background: #fff7ed;
          border-color: #fed7aa;
        }

        .pdf-detail-box h3 {
          margin: 0 0 10px;
          font-size: 15px;
          color: #0f172a;
        }

        .pdf-warning-box h3 {
          color: #9a3412;
        }

        .pdf-detail-box ul {
          padding-left: 18px;
          margin: 0;
        }

        .pdf-detail-box li {
          margin-bottom: 6px;
          color: #475569;
          font-size: 13px;
          line-height: 1.45;
        }

        .pdf-warning-box li {
          color: #7c2d12;
        }

        .pdf-interest-list {
          display: grid;
          gap: 12px;
        }

        .pdf-interest-row {
          padding: 15px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
        }

        .pdf-interest-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #334155;
        }

        .pdf-answers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .pdf-answer-chip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
        }

        .pdf-answer-chip span {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .pdf-answer-chip strong {
          color: #2563eb;
          font-size: 18px;
          font-weight: 900;
        }

        .pdf-footer {
          margin-top: 36px;
          padding-top: 22px;
          border-top: 1px solid #e5e7eb;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.45;
          text-align: center;
        }
      </style>

      <main class="pdf-document">
        <header class="pdf-header">
          <div class="pdf-badge">ФКТиПМ · Профориентационный тест</div>

          <h1>Результат профориентационного теста</h1>

          <p class="pdf-subtitle">
            Отчёт сформирован на основе ответов пользователя и сравнения профиля
            интересов с характеристиками образовательных программ.
          </p>
        </header>

        <section class="pdf-meta">
          <div class="pdf-meta-card">
            <span>Дата прохождения</span>
            <strong>${escapeHtml(currentDate)}</strong>
          </div>

          <div class="pdf-meta-card">
            <span>Уровень поступления</span>
            <strong>${formatEducationLevel(educationLevel)}</strong>
          </div>
        </section>

        ${
          bestResult
            ? `
              <section class="pdf-best-summary">
                <div class="pdf-best-label">★ Лучшее совпадение</div>
                <h2>${escapeHtml(bestResult.name)}</h2>
                <p>${escapeHtml(bestResult.description)}</p>
              </section>
            `
            : ""
        }

        <section class="pdf-section">
          <h2 class="pdf-section-title">Топ-3 рекомендации</h2>
          ${resultsHtml}
        </section>

        <section class="pdf-section">
          <h2 class="pdf-section-title">Профиль интересов</h2>
          <div class="pdf-interest-list">
            ${interestHtml}
          </div>
        </section>

        <section class="pdf-section">
          <h2 class="pdf-section-title">Ответы пользователя</h2>
          <div class="pdf-answers-grid">
            ${answersHtml}
          </div>
        </section>

        <footer class="pdf-footer">
          Отчёт сформирован автоматически рекомендательной системой.
        </footer>
      </main>
    </div>
  `;

  return wrapper;
}

export async function downloadTestResultPdf(
  params: DownloadTestResultPdfParams
) {
  const reportElement = createPdfReportElement(params);

  reportElement.style.position = "fixed";
  reportElement.style.left = "-10000px";
  reportElement.style.top = "0";
  reportElement.style.zIndex = "-1";

  document.body.appendChild(reportElement);

  const canvas = await html2canvas(reportElement, {
    scale: 2,
    backgroundColor: "#f8fafc",
    useCORS: true,
  });

  document.body.removeChild(reportElement);

  const imageData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = 210;
  const pageHeight = 297;

  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;

    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);

    heightLeft -= pageHeight;
  }

  pdf.save(`career-test-result-${Date.now()}.pdf`);
}