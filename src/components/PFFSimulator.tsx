import React, { useState, useMemo } from 'react';
import { Activity, Plus, Minus, ArrowUpRight, ArrowDownRight, Check, AlertTriangle, Layers } from 'lucide-react';

export const PFFSimulator: React.FC = () => {
  const [upperBound, setUpperBound] = useState<number>(65); // faults per 100 refs
  const [lowerBound, setLowerBound] = useState<number>(20); // faults per 100 refs
  const [allocatedFrames, setAllocatedFrames] = useState<number>(4);
  const [processLocalityComplexity, setProcessLocalityComplexity] = useState<'tight' | 'moderate' | 'diffuse'>('moderate');

  // Compute page fault rate based on frames and locality
  const currentFaultRate = useMemo(() => {
    let baseLocalityRequirement = 5;
    if (processLocalityComplexity === 'tight') baseLocalityRequirement = 3;
    if (processLocalityComplexity === 'diffuse') baseLocalityRequirement = 7;

    const deficit = baseLocalityRequirement - allocatedFrames;
    if (deficit > 2) return Math.min(95, 75 + deficit * 6);
    if (deficit === 2) return 72;
    if (deficit === 1) return 55;
    if (deficit === 0) return 32;
    if (deficit === -1) return 18;
    if (deficit === -2) return 10;
    return 6;
  }, [allocatedFrames, processLocalityComplexity]);

  // Determine OS Action
  const osAction = useMemo(() => {
    if (currentFaultRate > upperBound) {
      return {
        type: 'allocate',
        title: 'Fault Rate > Upper Bound (Starvation)',
        desc: 'Process is severely page-faulting because its working set is larger than allocated frames. OS allocates additional physical frames.',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        recommendation: 'Increase allocated frames by +1',
        icon: ArrowUpRight,
      };
    }
    if (currentFaultRate < lowerBound) {
      return {
        type: 'reclaim',
        title: 'Fault Rate < Lower Bound (Over-provisioned)',
        desc: 'Process has more frames than its locality requires. Excess frames are idling. OS deallocates and reclaims frames for the free pool.',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        recommendation: 'Reclaim frames by -1',
        icon: ArrowDownRight,
      };
    }
    return {
      type: 'optimal',
      title: 'Within Equilibrium Zone (Safe)',
      desc: 'Page fault rate is between Upper and Lower bounds. Frame allocation is balanced with active locality.',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      recommendation: 'Maintain current frame allocation',
      icon: Check,
    };
  }, [currentFaultRate, upperBound, lowerBound]);

  const autoBalance = () => {
    if (osAction.type === 'allocate') {
      setAllocatedFrames((f) => Math.min(10, f + 1));
    } else if (osAction.type === 'reclaim') {
      setAllocatedFrames((f) => Math.max(1, f - 1));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Page Fault Frequency (PFF) Strategy Lab
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore the chalkboard's second solution: setting Upper and Lower bounds on page fault rates to dynamically resize process frame allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={autoBalance}
            disabled={osAction.type === 'optimal'}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            Trigger OS Rebalance
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Curve & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive SVG Graph Replicating Board */}
        <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-300">PFF Threshold Curve</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Current Rate: <span className="font-bold text-emerald-400">{currentFaultRate}%</span>
            </span>
          </div>

          {/* SVG PFF Plot */}
          <div className="relative w-full h-56">
            <svg viewBox="0 0 500 220" className="w-full h-full">
              {/* Grid background */}
              <defs>
                <linearGradient id="equilibrium-zone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Equilibrium green region */}
              {upperBound > lowerBound && (
                <rect
                  x="50"
                  y={200 - (upperBound / 100) * 180}
                  width="430"
                  height={((upperBound - lowerBound) / 100) * 180}
                  fill="url(#equilibrium-zone)"
                />
              )}

              {/* Axes */}
              <line x1="50" y1="200" x2="50" y2="15" stroke="#64748b" strokeWidth="2" />
              <line x1="50" y1="200" x2="480" y2="200" stroke="#64748b" strokeWidth="2" />

              {/* Axis Labels */}
              <text x="18" y="110" fill="#94a3b8" fontSize="10" transform="rotate(-90 25,110)">
                Page Fault Rate (%)
              </text>
              <text x="350" y="215" fill="#94a3b8" fontSize="10">
                Number of Frames →
              </text>

              {/* Upper Bound Line */}
              <line
                x1="50"
                y1={200 - (upperBound / 100) * 180}
                x2="480"
                y2={200 - (upperBound / 100) * 180}
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4,3"
              />
              <text x="60" y={195 - (upperBound / 100) * 180} fill="#f43f5e" fontSize="10" fontWeight="bold">
                Upper Bound ({upperBound}%) → Allocate Frames
              </text>

              {/* Lower Bound Line */}
              <line
                x1="50"
                y1={200 - (lowerBound / 100) * 180}
                x2="480"
                y2={200 - (lowerBound / 100) * 180}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4,3"
              />
              <text x="60" y={195 - (lowerBound / 100) * 180} fill="#38bdf8" fontSize="10" fontWeight="bold">
                Lower Bound ({lowerBound}%) → Reclaim Frames
              </text>

              {/* Decreasing Page Fault Curve */}
              <path
                d="M 65 30 Q 110 140 180 160 Q 260 178 450 188"
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
              />

              {/* Current Operating Point marker */}
              {(() => {
                const markerX = 50 + (allocatedFrames / 10) * 400;
                const markerY = 200 - (currentFaultRate / 100) * 180;
                return (
                  <g>
                    <circle cx={markerX} cy={markerY} r="7" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={markerX} cy={markerY} r="14" fill="#fbbf24" fillOpacity="0.25" className="animate-ping" />
                    <text x={markerX + 10} y={markerY - 5} fill="#fbbf24" fontSize="10" fontWeight="bold">
                      {allocatedFrames} frames ({currentFaultRate}%)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Red Line: Upper Limit (Starvation threshold)</span>
            <span>Blue Line: Lower Limit (Excess frames threshold)</span>
          </div>
        </div>

        {/* Right: Interactive Controls & Policy Feedback */}
        <div className="lg:col-span-5 space-y-4">
          {/* OS Action Card */}
          <div className={`p-4 rounded-xl border ${osAction.badgeColor} space-y-2`}>
            <div className="flex items-center gap-2">
              <osAction.icon className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-slate-100">{osAction.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{osAction.desc}</p>
            <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs font-mono font-semibold">
              <span className="text-slate-400">Policy Recommendation:</span>
              <span className="text-slate-100">{osAction.recommendation}</span>
            </div>
          </div>

          {/* Allocated Frames Controller */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Allocated Process Frames:</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{allocatedFrames} Frames</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAllocatedFrames((f) => Math.max(1, f - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Remove Frame"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={10}
                value={allocatedFrames}
                onChange={(e) => setAllocatedFrames(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={() => setAllocatedFrames((f) => Math.min(10, f + 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Add Frame"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upper / Lower Bound Sliders */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-rose-400 font-medium">Upper Bound Threshold:</span>
                <span className="font-mono text-rose-300">{upperBound}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                value={upperBound}
                onChange={(e) => setUpperBound(Math.max(lowerBound + 5, Number(e.target.value)))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-sky-400 font-medium">Lower Bound Threshold:</span>
                <span className="font-mono text-sky-300">{lowerBound}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={lowerBound}
                onChange={(e) => setLowerBound(Math.min(upperBound - 5, Number(e.target.value)))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>

          {/* Process Locality Preset Selector */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Process Locality:</span>
            <div className="flex items-center gap-1">
              {(['tight', 'moderate', 'diffuse'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setProcessLocalityComplexity(mode)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    processLocalityComplexity === mode
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
