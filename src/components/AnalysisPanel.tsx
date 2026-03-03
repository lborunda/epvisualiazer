import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Info, ChevronRight, BrainCircuit, Sparkles } from 'lucide-react';
import { analyzeText, AnalysisResult } from '../services/epistemicService';

interface AnalysisPanelProps {
  onAnalyze: (result: AnalysisResult | null) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onAnalyze }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeText(input);
      setResult(data);
      setHistory(prev => [...prev, data]);
      onAnalyze(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = (critique: string) => {
    setInput(prev => `${prev}\n\nRefining based on critique: ${critique}\n\n[Your refinement here...]`);
  };

  const getResonanceLabel = (score: number) => {
    if (score >= 80) return "Dominant Paradigm";
    if (score >= 60) return "Strong Alignment";
    if (score >= 40) return "Moderate Influence";
    if (score >= 20) return "Peripheral Concept";
    return "Dissonant";
  };

  const getResonanceColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-gray-400";
    return "text-red-400/50";
  };

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-xl border-l border-white/10 text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-light tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-cyan-400" />
          Epistemic<span className="font-bold">Lens</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
          Philosophical Inquiry Engine
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Input Section */}
        <section>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Inquiry / Assumptions
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., We assume that user behavior is driven by rational economic choices, so if we lower the price, adoption will increase..."
              className="w-full h-32 bg-black/50 border border-white/20 rounded-xl p-4 text-sm focus:outline-none focus:border-magenta-500 focus:ring-1 focus:ring-magenta-500 transition-all resize-none text-gray-200 placeholder-gray-600"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              className="absolute bottom-3 right-3 p-2 bg-white text-black rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Research Question */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h3 className="text-xs uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Refined Question
                </h3>
                <p className="text-lg font-light leading-relaxed">
                  "{result.researchQuestion}"
                </p>
              </div>

              {/* Core Assumptions */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-magenta-400 mb-3">
                  Core Assumptions
                </h3>
                <ul className="space-y-2">
                  {result.coreAssumptions.map((assumption, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <ChevronRight className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Epistemic Breakdown */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-white/60 mb-4">
                  Epistemic Resonance
                </h3>
                <div className="space-y-4">
                  {result.scores.sort((a, b) => b.score - a.score).map((score) => (
                    <div key={score.thinker} className="group">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-200">{score.thinker}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${getResonanceColor(score.score)}`}>
                          {getResonanceLabel(score.score)}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score.score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            score.thinker.includes("Hume") ? "bg-[#FF00FF]" :
                            score.thinker.includes("Kant") ? "bg-white" :
                            score.thinker.includes("Popper") ? "bg-[#00FFFF]" :
                            score.thinker.includes("Lakatos") ? "bg-[#0088FF]" :
                            "bg-[#FF8800]"
                          }`}
                        />
                      </div>
                      
                      {/* Reasoning for all scores */}
                      <p className="text-[10px] text-gray-500 mb-2 leading-tight">
                        {score.reasoning}
                      </p>

                      {score.score > 40 && (
                        <div className="mt-2 pl-3 border-l-2 border-white/10">
                          <p className="text-xs text-gray-400 italic py-1">
                            "{score.critique}"
                          </p>
                          <button 
                            onClick={() => handleRefine(score.critique)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider mt-1 flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Refine with this lens
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-xl border border-white/10">
                <h3 className="text-xs uppercase tracking-widest text-green-400 mb-2">
                  Path Forward
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.recommendation}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase">Focus Type:</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    result.cohesionScore > 70 ? 'bg-green-500/20 text-green-400' :
                    result.cohesionScore > 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {result.cohesionScore > 70 ? "Highly Focused" : 
                     result.cohesionScore > 40 ? "Balanced" : 
                     "Pluralistic / Multi-disciplinary"}
                  </span>
                </div>
              </div>

              {/* Provocation / Shadow */}
              <div className="bg-red-900/20 p-5 rounded-xl border border-red-500/30">
                <h3 className="text-xs uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> The Provocation
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "{result.provocation}"
                </p>
                <p className="text-[10px] text-red-400/60 mt-2 uppercase tracking-wider">
                  Challenge from the opposing view
                </p>
              </div>

              {/* Pedagogical Note */}
              <div className="text-[10px] text-gray-600 border-t border-white/5 pt-4 mt-8">
                <p className="uppercase tracking-widest mb-1 font-bold">Pedagogical Note</p>
                <p>
                  This tool is a "Socratic Mirror," not a grader. A "Pluralistic" focus often indicates rich, multi-disciplinary inquiry. 
                  Use these critiques to deepen your methodology, not to conform to a single paradigm.
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="text-center py-10 opacity-30">
            <Info className="w-12 h-12 mx-auto mb-4 text-white" />
            <p className="text-sm">Enter your text to begin the epistemic analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};
