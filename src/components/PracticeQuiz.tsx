import React, { useState } from 'react';
import { PracticeQuestion } from '../types';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, ArrowRight, BookOpen } from 'lucide-react';

interface PracticeQuizProps {
  questions: PracticeQuestion[];
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (submitted[qId]) return; // locked once checked
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCheckAnswer = (qId: number) => {
    if (selectedAnswers[qId] === undefined) return;
    setSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  const handleReset = (qId: number) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setSubmitted((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const totalScore = questions.reduce((acc, q) => {
    if (submitted[q.id] && selectedAnswers[q.id] === q.correctIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const completedCount = Object.keys(submitted).length;

  return (
    <div className="space-y-6">
      {/* Quiz Progress & Score Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Operating Systems Practice Test (2 Understanding Checks)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify your comprehension of Working Set demand calculation ($D = \\sum WSS_i$) and Page Fault Frequency control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Score
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {totalScore} / {questions.length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
            {Math.round((completedCount / questions.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const isSubmitted = submitted[q.id];
          const isCorrect = isSubmitted && selectedAnswers[q.id] === q.correctIndex;
          const isIncorrect = isSubmitted && selectedAnswers[q.id] !== q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-slate-900 border rounded-2xl p-5 md:p-6 shadow-lg transition-all ${
                isCorrect
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : isIncorrect
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Question Tag */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Question 0{idx + 1}
                </span>

                {isSubmitted && (
                  <span
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <p className="text-slate-100 font-semibold text-sm md:text-base leading-relaxed mb-5 whitespace-pre-line">
                {q.question}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  const isThisCorrect = q.correctIndex === optIdx;

                  let optClass = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (isSelected && !isSubmitted) {
                    optClass = 'bg-indigo-950/60 border-indigo-500 text-indigo-100 shadow-sm';
                  } else if (isSubmitted) {
                    if (isThisCorrect) {
                      optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-100 font-semibold';
                    } else if (isSelected && !isThisCorrect) {
                      optClass = 'bg-rose-950/60 border-rose-500 text-rose-100';
                    } else {
                      optClass = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition-all flex items-start gap-3 ${optClass}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold font-mono shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-indigo-500 text-white border-indigo-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-normal">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                {!isSubmitted ? (
                  <button
                    disabled={!isAnswered}
                    onClick={() => handleCheckAnswer(q.id)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-1.5"
                  >
                    Check Answer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReset(q.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Try Again
                  </button>
                )}

                <span className="text-[11px] text-slate-500">
                  {isSubmitted ? 'Detailed TA breakdown below' : 'Select an option to submit'}
                </span>
              </div>

              {/* Explanation Section */}
              {isSubmitted && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" /> TA Step-by-Step Solution & Rationale:
                  </div>
                  <div className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
