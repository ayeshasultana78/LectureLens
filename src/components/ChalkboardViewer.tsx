import React, { useState } from 'react';
import { Hotspot } from '../types';
import { Eye, Info, Sparkles, ZoomIn, ZoomOut, AlertTriangle, Layers } from 'lucide-react';

interface ChalkboardViewerProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
}

export const ChalkboardViewer: React.FC<ChalkboardViewerProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
}) => {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'board' | 'annotated'>('annotated');
  const [showAmbiguities, setShowAmbiguities] = useState(true);

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 ring-2 ring-emerald-500/20" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100 tracking-wide flex items-center gap-2">
              Chalkboard Diagram Inspector
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Operating Systems Lecture
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowAmbiguities(!showAmbiguities)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showAmbiguities
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle blackboard transcription quirks & ambiguities"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Transcription Quirks {showAmbiguities ? 'On' : 'Off'}
          </button>

          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('annotated')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'annotated' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Overlay
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'board' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Slate
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg px-2 py-1 border border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
              className="p-1 hover:text-white text-slate-400"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 w-9 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))))}
              className="p-1 hover:text-white text-slate-400"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full overflow-auto bg-[#172c21] p-4 min-h-[460px] flex items-center justify-center select-none">
        {/* Blackboard Frame */}
        <div
          className="relative transition-transform duration-200 origin-center rounded-xl shadow-inner border-[10px] border-[#422d1e]"
          style={{
            transform: `scale(${zoom})`,
            width: '100%',
            maxWidth: '1020px',
            backgroundColor: '#1b3829',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.65), 0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Subtle Chalkboard Texture Overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #1b3829 1px)`,
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px',
            }}
          />

          {/* SVG Diagram Layer */}
          <svg viewBox="0 0 1000 520" className="w-full h-auto text-slate-100 font-sans">
            <defs>
              <filter id="chalk-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff" floodOpacity="0.45" />
              </filter>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#e2e8f0" />
              </marker>
            </defs>

            {/* TOP HEADER */}
            <text x="35" y="42" fill="#f8fafc" fontSize="20" fontFamily="serif" fontStyle="italic" filter="url(#chalk-glow)">
              Page Replacement Algm's;
            </text>
            <text x="35" y="70" fill="#f8fafc" fontSize="18" fontFamily="serif" textDecoration="underline" filter="url(#chalk-glow)">
              Thrashing;
            </text>

            {/* Solutions List */}
            <text x="35" y="240" fill="#fef08a" fontSize="16" fontFamily="serif">
              Sol'n :
            </text>
            <text x="35" y="270" fill="#f8fafc" fontSize="15" fontFamily="serif">
              1) Working set Model
            </text>
            <text x="35" y="300" fill="#f8fafc" fontSize="15" fontFamily="serif">
              2) Page Fault Frequency
            </text>

            {/* LEFT GRAPH: CPU Utilization vs Degree of Multiprogramming */}
            <g id="cpu-graph-group" className="cursor-pointer" onClick={() => onSelectHotspot(hotspots[0])}>
              {/* Axes */}
              <line x1="140" y1="210" x2="140" y2="105" stroke="#f8fafc" strokeWidth="2.5" markerEnd="url(#arrow)" />
              <line x1="140" y1="210" x2="300" y2="210" stroke="#f8fafc" strokeWidth="2.5" markerEnd="url(#arrow)" />
              
              {/* Y Axis Label */}
              <text x="75" y="155" fill="#e2e8f0" fontSize="12" transform="rotate(-90 90,155)">
                CPU Utilization
              </text>
              
              {/* X Axis Label */}
              <text x="145" y="232" fill="#e2e8f0" fontSize="12">
                Degree of multiprogramming
              </text>

              {/* Thrashing Bell Curve */}
              <path
                d="M 145 208 Q 185 205 205 155 Q 218 115 220 110 Q 225 115 235 155 Q 255 205 295 209"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="3"
                strokeDasharray="2,1"
              />

              {/* Peak dashed line */}
              <line x1="220" y1="110" x2="220" y2="210" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="4,4" />

              {/* Label near peak */}
              <text x="215" y="98" fill="#fef08a" fontSize="11" textAnchor="middle">
                Optimal Peak
              </text>

              {/* Thrashing drop annotation */}
              <text x="260" y="165" fill="#f87171" fontSize="11" fontWeight="bold">
                Thrashing ⚠️
              </text>
            </g>

            {/* AMBIGUITY NOTE 1: Δ ≠ ∞ or Δ → ∞ */}
            {showAmbiguities && (
              <g className="cursor-pointer" onClick={() => onSelectHotspot(hotspots[1])}>
                <circle cx="335" cy="225" r="14" fill="#fbbf24" fillOpacity="0.2" stroke="#fbbf24" strokeWidth="1.5" />
                <text x="335" y="229" fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">!</text>
                <text x="305" y="222" fill="#fed7aa" fontSize="14" fontFamily="serif">
                  Δ ≠ ∞
                </text>
              </g>
            )}

            {/* CENTER TOP: Working Set Window & Reference Strings */}
            <g id="working-set-group" className="cursor-pointer" onClick={() => onSelectHotspot(hotspots[1])}>
              <text x="350" y="65" fill="#f8fafc" fontSize="17" fontFamily="serif">
                Δ → working set window
              </text>

              {/* String 1 */}
              <g transform="translate(380, 85)">
                <text x="0" y="25" fill="#ffffff" fontSize="18" fontFamily="monospace" letterSpacing="7">
                  2 6 1 5 7 7 7 7 5 1
                </text>
                <text x="265" y="25" fill="#fef08a" fontSize="15" fontFamily="serif">
                  [t₁]
                </text>

                {/* Drawn chalk bracket on board (critiqued in ambiguities!) */}
                <path
                  d="M 95 38 C 130 48, 140 48, 175 48 C 210 48, 220 48, 255 38"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="2.2"
                />
                
                {/* Result Set 1 */}
                <text x="0" y="70" fill="#f8fafc" fontSize="16" fontFamily="serif">
                  WS(t₁) = {'{'} 1, 2, 5, 6, 7 {'}'}
                </text>

                {showAmbiguities && (
                  <text x="185" y="70" fill="#fcd34d" fontSize="11" fontStyle="italic">
                    ← (Requires Δ ≥ 10 to include 2 & 6!)
                  </text>
                )}
              </g>

              {/* String 2 */}
              <g transform="translate(380, 175)">
                <text x="0" y="25" fill="#ffffff" fontSize="18" fontFamily="monospace" letterSpacing="7">
                  3 4 4 4 3 4 3 4 4 4
                </text>
                <text x="265" y="25" fill="#fef08a" fontSize="15" fontFamily="serif">
                  [t₂]
                </text>

                {/* Result Set 2 */}
                <text x="0" y="60" fill="#f8fafc" fontSize="16" fontFamily="serif">
                  WS(t₂) = {'{'} 3, 4 {'}'}
                </text>

                <text x="0" y="90" fill="#f8fafc" fontSize="15" fontFamily="serif">
                  Δ → size
                </text>
              </g>
            </g>

            {/* CENTER RIGHT: Total Demand Formula */}
            <g id="demand-group" className="cursor-pointer" onClick={() => onSelectHotspot(hotspots[2])}>
              <text x="660" y="145" fill="#fde047" fontSize="20" fontFamily="serif" fontWeight="bold">
                D = ∑ WSSᵢ
              </text>
              <line x1="675" y1="155" x2="675" y2="175" stroke="#fde047" strokeWidth="2.5" markerEnd="url(#arrow)" />

              <text x="650" y="195" fill="#f8fafc" fontSize="13" fontFamily="serif">
                Total demand for frames
              </text>
              <text x="735" y="165" fill="#cbd5e1" fontSize="12" fontFamily="serif">
                Sum of working set size of all processes
              </text>

              {/* Conditions */}
              <text x="690" y="228" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="serif">
                D &gt; m
              </text>
              <text x="745" y="228" fill="#fca5a5" fontSize="12">
                → Thrashing occurs!
              </text>

              <text x="690" y="252" fill="#34d399" fontSize="16" fontWeight="bold" fontFamily="serif">
                D ≤ m
              </text>
              <text x="745" y="252" fill="#a7f3d0" fontSize="12">
                → Safe execution
              </text>
            </g>

            {/* BOTTOM RIGHT GRAPH: Page Fault Frequency (PFF) */}
            <g id="pff-graph-group" className="cursor-pointer" onClick={() => onSelectHotspot(hotspots[3])}>
              {/* Axes */}
              <line x1="590" y1="450" x2="590" y2="330" stroke="#f8fafc" strokeWidth="2.5" markerEnd="url(#arrow)" />
              <line x1="590" y1="450" x2="790" y2="450" stroke="#f8fafc" strokeWidth="2.5" markerEnd="url(#arrow)" />

              <text x="548" y="380" fill="#e2e8f0" fontSize="13" fontWeight="bold" transform="rotate(-90 560,380)">
                PFF
              </text>
              <text x="615" y="342" fill="#94a3b8" fontSize="11">
                more no. of frames →
              </text>

              {/* Upper Bound Line */}
              <line x1="570" y1="365" x2="775" y2="365" stroke="#f87171" strokeWidth="2" strokeDasharray="4,2" />
              <text x="685" y="360" fill="#fca5a5" fontSize="13" fontFamily="serif">
                Upper bound
              </text>

              {/* Lower Bound Line */}
              <line x1="570" y1="430" x2="775" y2="430" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,2" />
              <text x="700" y="443" fill="#bae6fd" fontSize="13" fontFamily="serif">
                Lower bound
              </text>

              {/* Decreasing PFF Curve */}
              <path
                d="M 605 330 Q 615 410 685 442 Q 720 448 775 450"
                fill="none"
                stroke="#4ade80"
                strokeWidth="3"
              />

              {/* Action tags */}
              <text x="780" y="365" fill="#f87171" fontSize="10">
                + Allocate Frames
              </text>
              <text x="780" y="430" fill="#38bdf8" fontSize="10">
                - Reclaim Frames
              </text>
            </g>

            {/* FAR RIGHT COLUMN: Optimal & LRU */}
            <g id="algorithms-group" className="cursor-pointer" onClick={() => onSelectHotspot(hotspots[4])}>
              <line x1="860" y1="20" x2="860" y2="500" stroke="#334155" strokeWidth="2" />
              
              <text x="870" y="45" fill="#f8fafc" fontSize="15" fontFamily="serif">
                optimal: 7, 0, 1, 2...
              </text>

              {/* Frame stacks */}
              <g transform="translate(875, 60)">
                <rect x="0" y="0" width="36" height="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="0" y="24" width="36" height="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="0" y="48" width="36" height="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="14" y="17" fill="#ffffff" fontSize="13">7</text>
              </g>

              <g transform="translate(930, 60)">
                <rect x="0" y="0" width="36" height="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="0" y="24" width="36" height="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="0" y="48" width="36" height="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="14" y="17" fill="#ffffff" fontSize="13">7</text>
                <text x="14" y="41" fill="#ffffff" fontSize="13">0</text>
              </g>

              <text x="870" y="175" fill="#f8fafc" fontSize="15" fontFamily="serif">
                LRU:
              </text>
              <g transform="translate(875, 190)">
                <rect x="0" y="0" width="36" height="22" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="0" y="22" width="36" height="22" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="0" y="44" width="36" height="22" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="14" y="16" fill="#ffffff" fontSize="12">7</text>
              </g>

              <text x="880" y="280" fill="#94a3b8" fontSize="13" fontFamily="monospace">
                3 2 1
              </text>
            </g>
          </svg>

          {/* Interactive Overlay Highlights */}
          {viewMode === 'annotated' && (
            <div className="absolute inset-0 pointer-events-none">
              {hotspots.map((hs) => {
                const isSelected = selectedHotspot?.id === hs.id;
                return (
                  <button
                    key={hs.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHotspot(isSelected ? null : hs);
                    }}
                    className={`absolute pointer-events-auto rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-lg ring-4 ring-yellow-400/30'
                        : 'border-cyan-400/50 bg-cyan-400/5 hover:border-cyan-300 hover:bg-cyan-400/15'
                    }`}
                    style={{
                      left: `${hs.x}%`,
                      top: `${hs.y}%`,
                      width: `${hs.width}%`,
                      height: `${hs.height}%`,
                    }}
                    title={hs.title}
                  >
                    <span
                      className={`absolute -top-3 left-2 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider text-slate-950 shadow-md ${
                        isSelected ? 'bg-yellow-400' : 'bg-cyan-300'
                      }`}
                    >
                      {hs.title.split('&')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Hotspot Bottom Drawer */}
      {selectedHotspot && (
        <div className="bg-slate-950/90 border-t border-slate-800 px-5 py-4 flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-100 text-sm">
                  {selectedHotspot.title}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Board Hotspot
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
                {selectedHotspot.shortDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectHotspot(null)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Navigation Pills */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 overflow-x-auto text-xs">
        <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Layers className="w-3 h-3" /> Quick Focus:
        </span>
        {hotspots.map((hs) => (
          <button
            key={hs.id}
            onClick={() => onSelectHotspot(selectedHotspot?.id === hs.id ? null : hs)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all text-xs ${
              selectedHotspot?.id === hs.id
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            {hs.title}
          </button>
        ))}
      </div>
    </div>
  );
};
