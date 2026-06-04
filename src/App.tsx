import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import "./App.css";

import { questions } from "./data/questions";
import { programs } from "./data/programs";
import { programVectors } from "./data/programVectors";

import { masterQuestions } from "./data/masterQuestions";
import { masterPrograms } from "./data/masterPrograms";
import { masterProgramVectors } from "./data/masterProgramVectors";

import { calculateResults } from "./logic/calculateResults";
import { calculateInterestProfile } from "./logic/calculateInterestProfile";

import { saveTestResult } from "./services/saveTestResult";

import EducationLevelScreen from "./components/EducationLevelScreen";
import StartScreen from "./components/StartScreen";
import QuestionScreen from "./components/QuestionScreen";
import ReviewScreen from "./components/ReviewScreen";
import ResultsScreen from "./components/ResultsScreen";
import AdminScreen from "./components/AdminScreen";

type EducationLevel = "bachelor" | "master";

function App() {
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(
    null
  );

  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const activeQuestions =
    educationLevel === "master" ? masterQuestions : questions;

  const activePrograms =
    educationLevel === "master" ? masterPrograms : programs;

  const activeProgramVectors =
    educationLevel === "master" ? masterProgramVectors : programVectors;

  const [answers, setAnswers] = useState<number[]>(
    Array(activeQuestions.length).fill(5)
  );

  const [showReview, setShowReview] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [isSavingResult, setIsSavingResult] = useState(false);

  const isAdminPage = window.location.pathname.endsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [educationLevel, testStarted, showReview, showResults, currentQuestion]);

  useEffect(() => {
    setAnswers(Array(activeQuestions.length).fill(5));
    setCurrentQuestion(0);
    setShowReview(false);
    setShowResults(false);
    setTestStarted(false);
    setSavedResultId(null);
    setIsSavingResult(false);
  }, [educationLevel, activeQuestions.length]);

  const currentAnswer = answers[currentQuestion];

  const progress = ((currentQuestion + 1) / activeQuestions.length) * 100;

  const results = calculateResults(
    answers,
    activePrograms,
    activeProgramVectors
  );

  const interestProfile = calculateInterestProfile(answers);

  const changeAnswer = (value: number) => {
    const newAnswers = [...answers];

    newAnswers[currentQuestion] = value;

    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      return;
    }

    setTestStarted(false);
    setShowReview(false);
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const handleShowResults = async () => {
    setShowReview(false);
    setShowResults(true);

    if (!educationLevel) {
      return;
    }

    setIsSavingResult(true);
    setSavedResultId(null);

    const resultId = await saveTestResult({
      educationLevel,
      answers,
      results,
      interestProfile,
    });

    setSavedResultId(resultId);
    setIsSavingResult(false);
  };

  const restartTest = () => {
    setEducationLevel(null);
    setTestStarted(false);
    setShowReview(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setSavedResultId(null);
    setIsSavingResult(false);
  };

  if (isAdminPage) {
    return (
      <div className="app">
        <AdminScreen />
      </div>
    );
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {!educationLevel ? (
          <motion.div
            key="level"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <EducationLevelScreen onSelect={setEducationLevel} />
          </motion.div>
        ) : !testStarted ? (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <StartScreen
              questionsCount={activeQuestions.length}
              programs={activePrograms}
              level={educationLevel}
              onStart={() => setTestStarted(true)}
              onBack={() => setEducationLevel(null)}
            />
          </motion.div>
        ) : showReview ? (
          <ReviewScreen
            questions={activeQuestions}
            answers={answers}
            onBack={() => setShowReview(false)}
            onShowResults={handleShowResults}
          />
        ) : showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {educationLevel && (
              <ResultsScreen
                results={results}
                interestProfile={interestProfile}
                educationLevel={educationLevel}
                answers={answers}
                onRestart={restartTest}
              />
            )}

            {isSavingResult && (
              <div style={{ display: "none" }}>Сохранение результата...</div>
            )}

            {savedResultId && (
              <div style={{ display: "none" }}>
                Результат сохранён: {savedResultId}
              </div>
            )}
          </motion.div>
        ) : (
          <QuestionScreen
            question={activeQuestions[currentQuestion]}
            currentAnswer={currentAnswer}
            currentQuestion={currentQuestion}
            totalQuestions={activeQuestions.length}
            progress={progress}
            onAnswerChange={changeAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            onFinish={() => setShowReview(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;