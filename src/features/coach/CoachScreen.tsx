import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { GroqProvider } from '../../ai/groqProvider';
import { runCoachAnalysis, explainExcerptWithCoach, type CoachProgressUpdate } from '../../ai/coach';
import { analysesRepo } from '../../db/repos';
import { PROMPT_VERSION } from '../../ai/prompts';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  ListOrdered, 
  Calendar, 
  ShieldAlert, 
  RefreshCw, 
  Key, 
  Brain, 
  Loader2,
  X
} from 'lucide-react';
import type { Analysis } from '../../db/schema';

type CoachTab = 'concepts' | 'weakspots' | 'order' | 'plan' | 'reality';

export const CoachScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const items = useLibraryStore(state => state.items);
  const subjects = useLibraryStore(state => state.subjects);
  const groqApiKey = useSettingsStore(state => state.groqApiKey);
  const aiModel = useSettingsStore(state => state.aiModel);

  const initialItemId = searchParams.get('itemId');
  const excerptParam = searchParams.get('excerpt');

  const [selectedItemId, setSelectedItemId] = useState<string>(initialItemId || '');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState<CoachTab>('concepts');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<CoachProgressUpdate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Excerpt explanation state
  const [excerptText, setExcerptText] = useState<string>(excerptParam || '');
  const [excerptExplanation, setExcerptExplanation] = useState<string>('');
  const [isExplainingExcerpt, setIsExplainingExcerpt] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const selectedItem = useMemo(() => items.find(i => i.id === selectedItemId), [items, selectedItemId]);

  // Set default document if none selected
  useEffect(() => {
    if (!selectedItemId && items.length > 0) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  // Check cached analysis when selectedItem changes
  useEffect(() => {
    let isCancelled = false;

    async function checkCached() {
      if (!selectedItem) {
        setAnalysis(null);
        return;
      }

      setErrorMsg('');
      const hash = selectedItem.fileHash || selectedItem.id;
      const cached = await analysesRepo.getByHashAndVersion(hash, PROMPT_VERSION);

      if (!isCancelled) {
        setAnalysis(cached || null);
      }
    }

    checkCached();

    return () => {
      isCancelled = true;
    };
  }, [selectedItem]);

  // Explain excerpt if passed via URL
  useEffect(() => {
    let isCancelled = false;

    async function runExcerptExplain() {
      if (!excerptText.trim() || !groqApiKey) return;
      setIsExplainingExcerpt(true);

      try {
        const provider = new GroqProvider({ apiKey: groqApiKey, model: aiModel });
        const result = await explainExcerptWithCoach(excerptText, provider);
        if (!isCancelled) {
          setExcerptExplanation(result);
          setIsExplainingExcerpt(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Excerpt explanation failed:', err);
          setIsExplainingExcerpt(false);
        }
      }
    }

    if (excerptText) {
      runExcerptExplain();
    }

    return () => {
      isCancelled = true;
    };
  }, [excerptText, groqApiKey, aiModel]);

  // Run full Map-Reduce analysis
  const handleStartAnalysis = async (forceRefresh = false) => {
    if (!selectedItem) return;
    if (!groqApiKey.trim()) {
      setErrorMsg('Groq API Key is missing. Please add your key in Settings.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setProgress({
      stage: 'reading',
      message: 'Starting blunt exam analysis...',
      progressPercent: 5,
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const provider = new GroqProvider({
        apiKey: groqApiKey,
        model: aiModel,
      });

      const result = await runCoachAnalysis(selectedItem, provider, {
        signal: controller.signal,
        forceRefresh,
        onProgress: (p) => setProgress(p),
      });

      setAnalysis(result);
      setIsAnalyzing(false);
      setProgress(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setProgress(null);
        setIsAnalyzing(false);
        return;
      }
      const message = err instanceof Error ? err.message : 'Analysis failed. Please check your network and API key.';
      setErrorMsg(message);
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setProgress(null);
  };

  return (
    <div className="h-full flex flex-col bg-bg pb-20 overflow-y-auto scroll-container">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-bg flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5 text-accent font-semibold text-xs uppercase tracking-wider">
              <Bot size={16} />
              <span>Blunt AI Coach</span>
            </div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Exam Breakdown</h1>
          </div>

          {analysis && (
            <button
              onClick={() => handleStartAnalysis(true)}
              disabled={isAnalyzing}
              className="p-2 rounded-xl bg-white/5 border border-border-subtle text-text-muted hover:text-text-primary active:scale-95 transition-all"
              title="Re-analyze document"
            >
              <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {/* Document Selector */}
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-text-muted mb-1">Target Document</label>
          <select
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value);
              setExcerptText('');
              setExcerptExplanation('');
            }}
            disabled={isAnalyzing}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-primary font-medium focus:outline-none focus:border-accent"
          >
            {items.map((item) => {
              const sub = subjectMap.get(item.subjectId);
              return (
                <option key={item.id} value={item.id}>
                  {item.title} {sub ? `(${sub.name})` : ''} [{item.kind.toUpperCase()}]
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Missing API Key Banner */}
      {!groqApiKey.trim() && (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Key size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-amber-300">Groq API Key Required</h2>
            <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
              Add your free Groq API key in Settings to unlock blunt AI document analysis and fast flashcard generation.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold active:scale-95 transition-all"
            >
              Configure Key in Settings
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mx-5 mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X size={14} /></button>
        </div>
      )}

      {/* Excerpt Explanation Card (if student selected text from reader) */}
      {excerptText && (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-lg relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-accent text-xs font-semibold">
              <Sparkles size={14} />
              <span>Highlighted Excerpt Breakdown</span>
            </div>
            <button
              onClick={() => setExcerptText('')}
              className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary"
            >
              <X size={14} />
            </button>
          </div>

          <blockquote className="text-[11px] text-text-secondary italic border-l-2 border-accent pl-2.5 my-2">
            "{excerptText}"
          </blockquote>

          {isExplainingExcerpt ? (
            <div className="flex items-center gap-2 py-3 text-xs text-accent">
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing excerpt mechanics & exam traps...</span>
            </div>
          ) : excerptExplanation ? (
            <div className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap mt-3 bg-bg-card p-3 rounded-xl border border-border-subtle">
              {excerptExplanation}
            </div>
          ) : null}
        </div>
      )}

      {/* Analysis Progress View */}
      {isAnalyzing && progress && (
        <div className="mx-5 mb-6 p-5 rounded-2xl bg-bg-card border border-border-medium shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="text-accent animate-spin" />
              <span className="text-xs font-semibold text-text-primary">Analyzing Document</span>
            </div>
            <span className="text-xs font-mono font-bold text-accent">{progress.progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-text-secondary">{progress.message}</p>

          <button
            onClick={handleCancel}
            className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-text-muted hover:text-text-primary active:scale-98 transition-all"
          >
            Cancel Analysis
          </button>
        </div>
      )}

      {/* Not Analyzed State */}
      {!analysis && !isAnalyzing && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-muted text-accent flex items-center justify-center mb-4">
            <Brain size={32} />
          </div>
          <h2 className="text-base font-bold text-text-primary mb-1">
            {selectedItem ? `Analyze ${selectedItem.title}` : 'Select a Document'}
          </h2>
          <p className="text-xs text-text-secondary max-w-xs mb-6 leading-relaxed">
            Get an honest concept ranking (1-5), weak spots breakdown, learning sequence, and daily study plan.
          </p>

          <button
            onClick={() => handleStartAnalysis(false)}
            disabled={!selectedItem || isAnalyzing}
            className="px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/25 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>Generate Blunt Coach Analysis</span>
          </button>
        </div>
      )}

      {/* Completed Analysis View */}
      {analysis && !isAnalyzing && (
        <div className="px-5 space-y-4">
          {/* Tab Bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-secondary border border-border-subtle overflow-x-auto scrollbar-none">
            {[
              { id: 'concepts', label: 'Concepts', icon: Flame },
              { id: 'weakspots', label: 'Weak Spots', icon: ShieldAlert },
              { id: 'order', label: 'Order', icon: ListOrdered },
              { id: 'plan', label: 'Study Plan', icon: Calendar },
              { id: 'reality', label: 'Reality Check', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CoachTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-accent text-white font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CONCEPTS */}
          {activeTab === 'concepts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Ranked by Exam Importance (1 = Low, 5 = Must-Know)</span>
                <span>{analysis.concepts.length} concepts</span>
              </div>

              {analysis.concepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-bg-card border border-border-subtle hover:border-border-medium transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-text-primary">{concept.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${
                        concept.importance >= 4
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : concept.importance === 3
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      Importance {concept.importance}/5
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{concept.why}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: WEAK SPOTS */}
          {activeTab === 'weakspots' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <ShieldAlert size={16} />
                <span>Common Student Traps & Misconceptions</span>
              </div>

              {analysis.weakSpots.map((spot, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">{spot}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LEARNING ORDER */}
          {activeTab === 'order' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                <ListOrdered size={16} />
                <span>Optimal Sequential Mastery Path</span>
              </div>

              {analysis.learningOrder.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-medium text-text-primary leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: STUDY PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-3">
              {analysis.plan.map((dayPlan) => (
                <div
                  key={dayPlan.day}
                  className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                    <Calendar size={14} />
                    <span>Day {dayPlan.day}</span>
                  </div>

                  <div className="space-y-2">
                    {dayPlan.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-text-muted hover:text-accent cursor-pointer flex-shrink-0 mt-0.5 transition-colors" />
                        <span className="text-xs text-text-secondary leading-snug">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: REALITY CHECK */}
          {activeTab === 'reality' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-bg-card to-bg-card border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider">
                <Bot size={18} />
                <span>Blunt Coach Reality Check</span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {analysis.realityCheck}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
