import React from 'react';
import { LessonAnalysis } from '../types';
import { Sparkles, CheckCircle, ShieldAlert, Cpu, Layers, Flame, Compass } from 'lucide-react';

interface ConceptualSummaryViewProps {
  analysis: LessonAnalysis;
  onNavigateToSim: () => void;
  onNavigateToQuiz: () => void;
}

export const ConceptualSummaryView: React.FC<ConceptualSummaryViewProps> = ({
  analysis,
  onNavigateToSim,
  onNavigateToQuiz,
}) => {
  return (
    <div className="space-y-6">
      {/* Key Takeaways Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Key Takeaways at a Glance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysis.keyTakeaways.map((takeaway, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Conceptual Summary Deep-Dive */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              Plain-English Conceptual Summary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive Teaching Assistant notes explaining the intuition, mechanisms, and trade-offs.
            </p>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium self-start sm:self-auto">
            {analysis.topicCategory}
          </span>
        </div>

        {/* Formatted Markdown Body */}
        <div className="text-slate-300 text-xs md:text-sm leading-relaxed space-y-4">
          {/* Section 1: Thrashing */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" /> The Problem: What Is Thrashing?
            </h3>
            <p>
              In modern computing, the OS uses <strong>multiprogramming</strong> to keep the CPU busy. If Process A waits for network data, the CPU switches to Process B. As long as processes have enough memory to hold their active code and data (their <em>locality</em>), performance is stellar.
            </p>
            <p>
              However, when too many processes share physical memory, each gets too few page frames. As a result, every process almost immediately triggers a <strong>page fault</strong>, demanding pages from disk. The CPU sits idle waiting for the disk I/O queue, which causes the OS scheduler to assume the system is underloaded—so it launches <em>even more processes</em>!
            </p>
            <p className="text-rose-300 font-medium">
              This vicious cycle is <strong>Thrashing</strong>: the CPU spends essentially 100% of its time swapping pages in and out, and CPU utilization plunges off a cliff to zero.
            </p>
          </div>

          {/* Section 2: Two Solutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Solution 1: Working Set Model
              </h3>
              <p>
                Proposed by Peter Denning (1968), this model tracks the <strong>Principle of Locality</strong>. It defines a sliding window of size <code className="text-indigo-300 font-mono">Δ</code> (in page references).
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-slate-100">WS(t):</strong> Set of unique pages accessed in the last Δ references.</li>
                <li><strong className="text-slate-100">WSSᵢ = |WSᵢ(t)|:</strong> Frames required by process <em>i</em>.</li>
                <li><strong className="text-slate-100">D = ∑ WSSᵢ:</strong> Total system frame demand.</li>
              </ul>
              <p className="text-emerald-300 font-medium">
                Invariant: If D ≤ m, safe. If D &gt; m, thrashing is imminent $\implies$ OS suspends one process to free frames.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Solution 2: Page Fault Frequency (PFF)
              </h3>
              <p>
                Rather than tracking discrete page reference histories, PFF directly monitors the actual hardware page fault rate of each running process.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-slate-100">Fault Rate &gt; Upper Bound:</strong> Process is starved of frames $\implies$ allocate more frames.</li>
                <li><strong className="text-slate-100">Fault Rate &lt; Lower Bound:</strong> Process has excess frames $\implies$ deallocate frames.</li>
              </ul>
              <p className="text-sky-300 font-medium">
                Dynamic feedback loop that converges on each process's natural locality size automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Summary Table */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Strategy Comparison: Working Set vs. Page Fault Frequency
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Metric / Property</th>
                  <th className="py-2.5 px-3">Working Set Model (Denning)</th>
                  <th className="py-2.5 px-3">Page Fault Frequency (PFF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-200">Core Metric</td>
                  <td className="py-2 px-3">Reference history over window Δ</td>
                  <td className="py-2 px-3">Page faults per unit of time</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-200">Overhead</td>
                  <td className="py-2 px-3">High (must track reference bits frequently)</td>
                  <td className="py-2 px-3">Low (interrupt-driven only on page faults)</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-200">Reaction Time</td>
                  <td className="py-2 px-3">Proactive (adjusts before fault occurs)</td>
                  <td className="py-2 px-3">Reactive (adjusts in response to faults)</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-200">Action on Full RAM</td>
                  <td className="py-2 px-3">Suspend process if D &gt; m</td>
                  <td className="py-2 px-3">Suspend process if fault rate &gt; Upper bound</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick CTA Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Ready to test your intuition interactively?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToSim}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Open Interactive Simulator →
            </button>
            <button
              onClick={onNavigateToQuiz}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Take Practice Test →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
