import React, { useState, useRef } from 'react';
import { LessonAnalysis } from '../types';
import { Upload, Sparkles, Image as ImageIcon, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AIWhiteboardScannerProps {
  onAnalysisComplete: (data: LessonAnalysis) => void;
  onResetToDefault: () => void;
  isCustomLoaded: boolean;
}

export const AIWhiteboardScanner: React.FC<AIWhiteboardScannerProps> = ({
  onAnalysisComplete,
  onResetToDefault,
  isCustomLoaded,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subjectTopic, setSubjectTopic] = useState('Operating Systems / Memory Management');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview && !notesText.trim()) {
      setError('Please upload a whiteboard photo or enter lecture notes to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          notesText: notesText.trim(),
          topic: subjectTopic,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error while analyzing whiteboard.');
      }

      const data: LessonAnalysis = await response.json();
      onAnalysisComplete(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process lecture analysis. Check network or Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Whiteboard & Lecture Scanner
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload another classroom blackboard photo, handwritten slide, or paste transcription to generate a full 3-part TA breakdown.
          </p>
        </div>

        {isCustomLoaded && (
          <button
            onClick={onResetToDefault}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Reset to Chalkboard Lecture
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upload Zone */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Upload Whiteboard / Blackboard Photo
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[170px] ${
              imagePreview
                ? 'border-indigo-500/80 bg-indigo-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="relative group w-full flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Uploaded whiteboard preview"
                  className="max-h-32 object-contain rounded-lg shadow-md"
                />
                <span className="text-[11px] text-indigo-300 mt-2 font-medium">
                  Click to replace photo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Drop whiteboard photo or click to browse
                </span>
                <span className="text-[10px] text-slate-500">
                  Supports JPG, PNG, WEBP (board photos, slides, written notes)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Text Notes / Topic Context */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Course / Topic Category
            </label>
            <input
              type="text"
              value={subjectTopic}
              onChange={(e) => setSubjectTopic(e.target.value)}
              placeholder="e.g. Operating Systems, Computer Architecture, Algorithms"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Optional Transcript or Professor's Verbal Hints
            </label>
            <textarea
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g., 'Professor emphasized that Δ is the window size in page references, and thrashing happens when D > m...'"
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Teaching Assistant is Analyzing Board...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Teaching Assistant Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
