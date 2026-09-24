import React, { useState } from 'react';
import { StepBreakdown } from '../types';
import { BookOpen, AlertTriangle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface FormulaBreakdownViewProps {
  steps: StepBreakdown[];
}

export const FormulaBreakdownView: React.FC<FormulaBreakdownViewProps> = ({ steps }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Note */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Formal Mathematical Breakdown & Blackboard Transcription Audit
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Every symbol, set notation, and equation transcribed directly from the chalkboard has been rigorously analyzed below. 
            Crucial instructor ambiguities, sloppy chalk spans, and handwritten shorthand quirks are explicitly highlighted in amber badges.
          </p>
        </div>
      </div>

      {/* Step Cards */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isExpanded = expandedIndex === idx || expandedIndex === null;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-slate-700"
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="flex items-center justify-between p-4 bg-slate-950/60 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold font-mono">
                    0{idx + 1}
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm md:text-base">
                    {step.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {step.ambiguitiesOrErrors && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <AlertTriangle className="w-3 h-3" /> Transcription Quirk Identified
                    </span>
                  )}
                  <button className="text-slate-400 hover:text-slate-200 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Formula Display Box */}
              <div className="px-5 py-3.5 bg-slate-950 border-y border-slate-800/80 flex items-center justify-between font-mono text-sm text-indigo-300 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase font-sans font-semibold">Notation:</span>
                  <code className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-indigo-200 font-bold tracking-wide">
                    {step.formulaOrCode}
                  </code>
                </div>

                <button
                  onClick={() => handleCopy(step.formulaOrCode, idx)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy formula"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
                {/* Explanation text formatted with linebreaks */}
                <div className="whitespace-pre-line space-y-2">
                  {step.explanation}
                </div>

                {/* Ambiguities and Transcription Errors Identified */}
                {step.ambiguitiesOrErrors && (
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200/90 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      Chalkboard Ambiguity / Transcription Error Identified:
                    </div>
                    <p className="text-xs leading-relaxed text-amber-200">
                      {step.ambiguitiesOrErrors}
                    </p>
                  </div>
                )}

                {/* Practical Engineering Tip */}
                {step.practicalTip && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="text-emerald-300">TA Practical Tip: </strong>
                      {step.practicalTip}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
