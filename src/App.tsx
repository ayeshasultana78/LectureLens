import React, { useState } from 'react';
import { OS_LECTURE_DATA, OS_WHITEBOARD_HOTSPOTS } from './data/osLectureData';
import { LessonAnalysis, Hotspot } from './types';
import { ChalkboardViewer } from './components/ChalkboardViewer';
import { ConceptualSummaryView } from './components/ConceptualSummaryView';
import { FormulaBreakdownView } from './components/FormulaBreakdownView';
import { WorkingSetSimulator } from './components/WorkingSetSimulator';
import { PFFSimulator } from './components/PFFSimulator';
import { PracticeQuiz } from './components/PracticeQuiz';
import { AIWhiteboardScanner } from './components/AIWhiteboardScanner';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Cpu,
  Activity,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'board' | 'summary' | 'formulas' | 'wssim' | 'pffsim' | 'quiz' | 'scanner'
  >('board');

  const [currentAnalysis, setCurrentAnalysis] = useState<LessonAnalysis>(OS_LECTURE_DATA);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isCustomLesson, setIsCustomLesson] = useState<boolean>(false);

  const handleCustomAnalysis = (data: LessonAnalysis) => {
    setCurrentAnalysis(data);
    setIsCustomLesson(true);
    setActiveTab('summary');
  };

  const handleResetToDefault = () => {
    setCurrentAnalysis(OS_LECTURE_DATA);
    setIsCustomLesson(false);
    setSelectedHotspot(null);
    setActiveTab('board');
  };

  const handleSelectHotspot = (hs: Hotspot | null) => {
    setSelectedHotspot(hs);
    if (hs) {
      if (hs.id === 'working-set-def' || hs.id === 'demand-formula') {
        // Can optionally give quick jump or keep in view
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  LectureLens
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Teaching Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-md">
                {currentAnalysis.title}
              </p>
            </div>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-2">
            {isCustomLesson && (
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                title="Return to the uploaded OS Blackboard"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Original Blackboard</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Scan New Whiteboard</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-1 text-xs border-t border-slate-900 scrollbar-none">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'board'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Chalkboard Inspector
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'summary'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            1. Conceptual Summary
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'formulas'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            2. Formula & Transcription Audit
          </button>

          <button
            onClick={() => setActiveTab('wssim')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'wssim'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Working Set Simulator
          </button>

          <button
            onClick={() => setActiveTab('pffsim')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'pffsim'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            PFF Simulator
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'quiz'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            3. Practice Test ({currentAnalysis.practiceQuestions.length} Questions)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: Blackboard Diagram Inspector */}
        {activeTab === 'board' && (
          <div className="space-y-6 animate-fadeIn">
            <ChalkboardViewer
              hotspots={OS_WHITEBOARD_HOTSPOTS}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={handleSelectHotspot}
            />

            {/* Quick Cards below board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('summary')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-indigo-400 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Part 1: Conceptual Summary
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-300">
                  Read plain-English explanation of Thrashing, locality of reference, and why multiprogramming collapses.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('formulas')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" /> Part 2: Formulas & Board Quirks
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-300">
                  Inspect the mathematical formulas: $WS(t)$, $WSS_i$, $D = \sum WSS_i$, plus the professor's chalk bracket ambiguity.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('quiz')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Part 3: Test Understanding
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-300">
                  Solve 2 exam-level practice questions with immediate evaluation and step-by-step TA proof.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Conceptual Summary */}
        {activeTab === 'summary' && (
          <div className="animate-fadeIn">
            <ConceptualSummaryView
              analysis={currentAnalysis}
              onNavigateToSim={() => setActiveTab('wssim')}
              onNavigateToQuiz={() => setActiveTab('quiz')}
            />
          </div>
        )}

        {/* TAB 3: Formula Breakdown & Ambiguities */}
        {activeTab === 'formulas' && (
          <div className="animate-fadeIn">
            <FormulaBreakdownView steps={currentAnalysis.stepByStepBreakdown} />
          </div>
        )}

        {/* TAB 4: Working Set Simulator */}
        {activeTab === 'wssim' && (
          <div className="animate-fadeIn">
            <WorkingSetSimulator />
          </div>
        )}

        {/* TAB 5: PFF Simulator */}
        {activeTab === 'pffsim' && (
          <div className="animate-fadeIn">
            <PFFSimulator />
          </div>
        )}

        {/* TAB 6: Practice Quiz */}
        {activeTab === 'quiz' && (
          <div className="animate-fadeIn">
            <PracticeQuiz questions={currentAnalysis.practiceQuestions} />
          </div>
        )}

        {/* TAB 7: AI Whiteboard Scanner */}
        {activeTab === 'scanner' && (
          <div className="animate-fadeIn">
            <AIWhiteboardScanner
              onAnalysisComplete={handleCustomAnalysis}
              onResetToDefault={handleResetToDefault}
              isCustomLoaded={isCustomLesson}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>
          LectureLens &bull; Interactive Whiteboard & Lecture Teaching Assistant &bull; Operating Systems Memory Management
        </p>
      </footer>
    </div>
  );
}
