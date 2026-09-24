import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, AlertOctagon, CheckCircle2, ShieldAlert, Cpu, ArrowRight, Info, Plus } from 'lucide-react';

export const WorkingSetSimulator: React.FC = () => {
  // Reference Strings from chalkboard
  const PRESETS = [
    {
      name: 'Chalkboard Example 1 (t₁)',
      refs: [2, 6, 1, 5, 7, 7, 7, 7, 5, 1],
      defaultDelta: 10,
      notes: 'Contains high variety of pages {1, 2, 5, 6, 7}. Notice how Δ must be 10 to include 2 and 6.',
    },
    {
      name: 'Chalkboard Example 2 (t₂)',
      refs: [3, 4, 4, 4, 3, 4, 3, 4, 4, 4],
      defaultDelta: 10,
      notes: 'Demonstrates tight locality of reference. Only pages {3, 4} are referenced, needing only 2 frames!',
    },
    {
      name: 'Thrashing Scenario (Phases)',
      refs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4],
      defaultDelta: 6,
      notes: 'Rapid phase changes with high locality spread that stresses available frames.',
    },
  ];

  const [activePreset, setActivePreset] = useState(0);
  const [refString, setRefString] = useState<number[]>(PRESETS[0].refs);
  const [delta, setDelta] = useState<number>(PRESETS[0].defaultDelta);
  const [currentTimeIndex, setCurrentTimeIndex] = useState<number>(PRESETS[0].refs.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Multi-Process Memory Frame Allocation System
  const [totalPhysicalFrames, setTotalPhysicalFrames] = useState<number>(7);
  const [p2WorkingSetSize, setP2WorkingSetSize] = useState<number>(3);
  const [p2Suspended, setP2Suspended] = useState<boolean>(false);

  // Auto-play timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          if (prev >= refString.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isPlaying, refString.length]);

  const handleSelectPreset = (idx: number) => {
    setActivePreset(idx);
    setRefString(PRESETS[idx].refs);
    setDelta(PRESETS[idx].defaultDelta);
    setCurrentTimeIndex(PRESETS[idx].refs.length - 1);
    setIsPlaying(false);
  };

  // Compute Active Window slice
  const startIndex = Math.max(0, currentTimeIndex - delta + 1);
  const currentWindowRefs = useMemo(() => {
    return refString.slice(startIndex, currentTimeIndex + 1);
  }, [refString, startIndex, currentTimeIndex]);

  // Compute unique working set WS(t)
  const workingSet = useMemo(() => {
    const unique = Array.from(new Set(currentWindowRefs)).sort((a, b) => a - b);
    return unique;
  }, [currentWindowRefs]);

  const wss1 = workingSet.length;
  const effectiveWss2 = p2Suspended ? 0 : p2WorkingSetSize;
  const totalDemandD = wss1 + effectiveWss2;
  const isThrashing = totalDemandD > totalPhysicalFrames;

  // Approximate simulated CPU utilization
  const simulatedCpuUtil = useMemo(() => {
    if (isThrashing) {
      // Severe degradation down to 3-12%
      const deficit = totalDemandD - totalPhysicalFrames;
      return Math.max(4, Math.round(18 - deficit * 5));
    }
    // Healthy utilization between 78% and 94%
    return Math.min(95, Math.round(75 + (totalDemandD / totalPhysicalFrames) * 18));
  }, [isThrashing, totalDemandD, totalPhysicalFrames]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Working Set Model & Thrashing Lab
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test Peter Denning's model with chalkboard reference strings, slide window size <span className="text-indigo-300 font-semibold font-mono">Δ</span>, and monitor memory frame demand <span className="text-yellow-400 font-semibold font-mono">D = ∑ WSSᵢ</span>.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Note */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <span>{PRESETS[activePreset].notes}</span>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        {/* Delta (Window Size) Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">
              Window Size (Δ): <span className="text-indigo-400 font-mono text-sm">{delta}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {delta >= 10 ? 'Full Board Scope' : delta < 6 ? 'Too Narrow Locality' : 'Moderate Window'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={Math.max(10, refString.length)}
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Δ = 1 (Single ref)</span>
            <span>Δ = 6 (Chalk bracket)</span>
            <span>Δ = 10 (Full string)</span>
          </div>
        </div>

        {/* Current Time Step Slider & Play/Pause */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">
              Time Step (t): <span className="text-emerald-400 font-mono text-sm">t{currentTimeIndex + 1}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                title={isPlaying ? 'Pause' : 'Auto Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTimeIndex(0);
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Reset to t1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={refString.length - 1}
            value={currentTimeIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentTimeIndex(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Start (t1)</span>
            <span>End (t{refString.length})</span>
          </div>
        </div>

        {/* Total Physical Frames (m) Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">
              Available Frames (m): <span className="text-yellow-400 font-mono text-sm">{totalPhysicalFrames}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              RAM Capacity
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            value={totalPhysicalFrames}
            onChange={(e) => setTotalPhysicalFrames(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>3 frames (Starved)</span>
            <span>7 (Normal)</span>
            <span>12 (Abundant)</span>
          </div>
        </div>
      </div>

      {/* Reference Stream Visualization with Sliding Window Bracket */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
          <span>Process 1 Memory Reference Stream:</span>
          <span className="text-[11px] text-slate-400 font-mono">
            Active Window: indices [{startIndex} ... {currentTimeIndex}] (Length: {currentWindowRefs.length})
          </span>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          {/* Reference Numbers Stream */}
          <div className="flex items-center justify-start gap-2 min-w-max pb-2">
            {refString.map((val, idx) => {
              const inWindow = idx >= startIndex && idx <= currentTimeIndex;
              const isCurrent = idx === currentTimeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentTimeIndex(idx)}
                  className={`relative flex flex-col items-center justify-center w-10 h-14 rounded-lg font-mono transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-300 scale-105 shadow-md shadow-emerald-500/30'
                      : inWindow
                      ? 'bg-indigo-950/80 text-indigo-200 border-2 border-indigo-500/80 font-semibold'
                      : 'bg-slate-900/80 text-slate-500 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <span className="text-base">{val}</span>
                  <span className="text-[9px] opacity-70">t{idx + 1}</span>
                  {isCurrent && (
                    <span className="absolute -top-2.5 px-1 py-0.2 text-[8px] font-sans font-bold bg-emerald-300 text-slate-950 rounded">
                      NOW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bracket Indicator Bar */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-indigo-400 font-mono text-[11px]">
              Window [t - Δ + 1 ... t] contains: [{currentWindowRefs.join(', ')}]
            </span>
            <span className="text-slate-400 text-[11px]">
              Click any reference to inspect that exact time step
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Math & Set Calculation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Working Set of Process 1 */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Process 1 Working Set
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              WSS₁ = {wss1}
            </span>
          </div>

          <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 font-mono text-xs">
            <div className="text-slate-400 text-[11px]">Formula: WS(t) = unique(window)</div>
            <div className="text-slate-100 font-bold text-sm mt-1">
              WS(t) = {'{ ' + workingSet.join(', ') + ' }'}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            Process 1 needs <strong className="text-indigo-300">{wss1} frames</strong> to prevent internal page faults for its active locality.
          </p>
        </div>

        {/* Card 2: Process 2 (Concurrency & Multiprogramming) */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Process 2 (Concurrent Process)
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                p2Suspended
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}
            >
              WSS₂ = {effectiveWss2} {p2Suspended && '(SUSPENDED)'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 text-xs">
            <span className="text-slate-300">Allocated Demand:</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={p2Suspended}
                onClick={() => setP2WorkingSetSize((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30"
              >
                -
              </button>
              <span className="font-mono text-sm font-bold text-cyan-400 w-4 text-center">
                {p2WorkingSetSize}
              </span>
              <button
                disabled={p2Suspended}
                onClick={() => setP2WorkingSetSize((s) => Math.min(8, s + 1))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">OS Process Status:</span>
            <button
              onClick={() => setP2Suspended(!p2Suspended)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                p2Suspended
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
              }`}
            >
              {p2Suspended ? 'Resume Process 2' : 'Suspend Process 2'}
            </button>
          </div>
        </div>

        {/* Card 3: Total System Demand Invariant (D vs m) */}
        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            isThrashing
              ? 'bg-rose-950/30 border-rose-600/50 shadow-lg shadow-rose-950/20'
              : 'bg-slate-950 border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Demand D = ∑ WSSᵢ
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${
                isThrashing
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isThrashing ? 'D > m (THRASHING)' : 'D ≤ m (SAFE)'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 font-mono text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400">D = {wss1} + {effectiveWss2} = </span>
              <span className={`font-bold text-sm ${isThrashing ? 'text-rose-400' : 'text-emerald-400'}`}>
                {totalDemandD} frames
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">m = </span>
              <span className="font-bold text-yellow-400 text-sm">{totalPhysicalFrames} frames</span>
            </div>
          </div>

          {/* Progress Bar of Memory Capacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>RAM Load: {Math.round((totalDemandD / totalPhysicalFrames) * 100)}%</span>
              <span>Available: {totalPhysicalFrames}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (wss1 / totalPhysicalFrames) * 100)}%` }}
                title={`P1 Demand: ${wss1}`}
              />
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100 - (wss1 / totalPhysicalFrames) * 100, (effectiveWss2 / totalPhysicalFrames) * 100)}%` }}
                title={`P2 Demand: ${effectiveWss2}`}
              />
              {isThrashing && (
                <div
                  className="bg-rose-500 h-full animate-pulse transition-all duration-300"
                  style={{ width: `${Math.min(100, ((totalDemandD - totalPhysicalFrames) / totalPhysicalFrames) * 100)}%` }}
                  title="Overcapacity Deficit"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Thrashing Status Banner / OS Action Alert */}
      {isThrashing ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                Thrashing Invariant Violated! Total Demand D ({totalDemandD}) &gt; RAM frames m ({totalPhysicalFrames})
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
                Processes are repeatedly evicting each other's active working pages. Simulated CPU Utilization has crashed to{' '}
                <strong className="text-rose-200 font-mono">{simulatedCpuUtil}%</strong> while the disk swap queue saturates.
              </p>
            </div>
          </div>

          <button
            onClick={() => setP2Suspended(true)}
            className="shrink-0 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-900/40 flex items-center gap-1.5"
          >
            Apply OS Fix: Suspend Process 2 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-200">
                System Memory Invariant Satisfied (D ≤ m):
              </span>
              <span className="text-xs text-emerald-300/80 ml-1.5">
                All processes have full working set frames allocated. Simulated CPU Utilization is steady at{' '}
                <strong className="text-emerald-200 font-mono">{simulatedCpuUtil}%</strong>.
              </span>
            </div>
          </div>

          {p2Suspended && (
            <button
              onClick={() => setP2Suspended(false)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 font-medium"
            >
              Resume Suspended Process
            </button>
          )}
        </div>
      )}
    </div>
  );
};
