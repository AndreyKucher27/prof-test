import { useState } from "react";
import { motion } from "framer-motion";

import { downloadTestResultPdf } from "../services/downloadTestResultPdf";
import { downloadTestResult } from "../services/downloadTestResult";

import type { Result } from "../types/result";
import type { InterestProfile } from "../types/interest";

import InterestRadarChart from "./InterestRadarChart";

type ResultsScreenProps = {
  results: Result[];
  interestProfile: InterestProfile[];
  educationLevel: "bachelor" | "master";
  answers: number[];
  onRestart: () => void;
};

function ResultsScreen({
  results,
  interestProfile,
  educationLevel,
  answers,
  onRestart,
}: ResultsScreenProps) {
  const [openedResult, setOpenedResult] = useState<string | null>(null);

  const bestResult = results[0];
  const bestReasons = bestResult?.reasons.slice(0, 4) ?? [];
  const alternativeResults = results.slice(1);

  return (
    <div className="container results-page redesigned-results">
      <div className="results-hero-header">
        <div className="badge badge-results">Результаты теста</div>

        <h1>Ваши рекомендации готовы</h1>

        <p>
          Система проанализировала ваши ответы, сформировала профиль интересов
          и выбрала наиболее подходящие образовательные профили.
        </p>
      </div>

      {bestResult && (
        <section className="result-hero-card">
          <div className="result-hero-main">
            <span className="result-hero-kicker">★ Лучшее совпадение</span>

            <h2>{bestResult.name}</h2>

            <p>{bestResult.description}</p>
          </div>

          <div className="result-hero-score">
            <strong>{bestResult.percent}%</strong>
            <span>совпадение</span>
          </div>
        </section>
      )}

      {bestReasons.length > 0 && (
        <section className="result-reasons-panel">
          <div className="section-mini-header">
            <span>Почему подходит</span>
            <h2>Ключевые причины рекомендации</h2>
          </div>

          <div className="result-reason-chips">
            {bestReasons.map((reason) => (
              <div className="result-reason-chip" key={reason}>
                <span>✓</span>
                <p>{reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <InterestRadarChart interestProfile={interestProfile} />

      <section className="alternative-results-section">
        <div className="section-mini-header">
          <span>Альтернативы</span>

          <h2>Также подходящие профили</h2>

          <p>
            Эти варианты тоже близки к вашему профилю интересов и могут быть
            рассмотрены как дополнительные направления выбора.
          </p>
        </div>

        <div className="alternative-results-list">
          {alternativeResults.map((result, index) => {
            const isOpen = openedResult === result.name;

            return (
              <motion.div
                className="alternative-result-card"
                key={result.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                  ease: "easeOut",
                }}
              >
                <button
                  className="alternative-result-toggle"
                  onClick={() => setOpenedResult(isOpen ? null : result.name)}
                >
                  <div className="alternative-result-left">
                    <span className="alternative-rank">{index + 2}</span>

                    <div>
                      <h3>{result.name}</h3>
                      <p>{result.description}</p>
                    </div>
                  </div>

                  <div className="alternative-result-right">
                    <strong>{result.percent}%</strong>
                    <span className={isOpen ? "open" : ""}>+</span>
                  </div>
                </button>

                <div className="alternative-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${result.percent}%` }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
                  />
                </div>

                {isOpen && (
                  <div className="alternative-details">
                    <div className="details-grid">
                      <div className="reasons">
                        <h3 className="details-title details-title-good">
                          Почему подходит
                        </h3>

                        <ul>
                          {result.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {result.warnings.length > 0 && (
                        <div className="warnings">
                          <h3 className="details-title details-title-warning">
                            На что обратить внимание
                          </h3>

                          <ul>
                            {result.warnings.map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="result-actions-panel">
        <div>
          <span className="result-actions-badge">Сохранить результат</span>

          <h2>Скачайте отчёт или пройдите тест заново</h2>

          <p>
            PDF подойдёт для печати и отправки, HTML — для просмотра результата
            в браузере.
          </p>
        </div>

        <div className="result-action-buttons">
          <button
            className="button"
            onClick={() =>
              downloadTestResultPdf({
                educationLevel,
                answers,
                results,
                interestProfile,
              })
            }
          >
            Скачать PDF
          </button>

          <button
            className="button secondary"
            onClick={() =>
              downloadTestResult({
                educationLevel,
                answers,
                results,
                interestProfile,
              })
            }
          >
            Скачать HTML
          </button>

          <button className="button secondary" onClick={onRestart}>
            Пройти заново
          </button>
        </div>
      </section>
    </div>
  );
}

export default ResultsScreen;