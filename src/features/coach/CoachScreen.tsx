import React, { useEffect, useState } from 'react';
import { db, Document, CoachAnalysis } from '../../db';
import { useSettingsStore } from '../../store/useSettingsStore';
import { GroqProvider } from '../../ai/groqProvider';
import { runCoachAnalysis } from '../../ai/coach';
import { TopAppBar, ButtonGroup, Button, LoadingIndicator } from '../../components/m3e';
import { AnalysisCard, AnalysisTabKey } from '../../components/m3e/cards';
import { Brain, Flame, MessageSquare, Send, Sparkles, Key, AlertCircle } from 'lucide-react';

interface CoachScreenProps {
  initialDocId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const CoachScreen: React.FC<CoachScreenProps> = ({
  initialDocId,
  onNavigateTab,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AnalysisTabKey>('overview');
  const [qaPrompt, setQaPrompt] = useState('');
  const [qaLog, setQaLog] = useState<{ q: string; a: string; error?: boolean }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  const groqApiKey = useSettingsStore(state => state.groqApiKey);
  const aiModel = useSettingsStore(state => state.aiModel);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await db.documents.toArray();
        setDocuments(docs);
        if (docs.length > 0) {
          const target = initialDocId ? docs.find(d => d.id === initialDocId) || docs[0] : docs[0];
          setSelectedDoc(target);
        }
      } catch (err) {
        console.error('Failed to load documents for coach:', err);
      }
    };
    loadDocs();
  }, [initialDocId]);

  useEffect(() => {
    if (!selectedDoc) {
      setAnalysis(null);
      return;
    }
    const loadAnalysis = async () => {
      setLoading(true);
      setAnalysisError('');
      try {
        const existing = await db.coachAnalyses.where('docId').equals(selectedDoc.id).first()
          || await db.coachAnalyses.where('itemId').equals(selectedDoc.id).first();
        if (existing) {
          setAnalysis(existing);
        } else {
          setAnalysis(null);
        }
      } catch (err) {
        console.error('Failed to load analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [selectedDoc]);

  const handleGenerateAnalysis = async () => {
    if (!selectedDoc) return;
    if (!groqApiKey.trim()) {
      setAnalysisError('Please enter your Groq API Key in Settings to run AI analysis.');
      return;
    }

    setLoading(true);
    setAnalysisError('');
    setAnalysisProgress('Connecting to Groq AI engine...');

    try {
      const provider = new GroqProvider({ apiKey: groqApiKey, model: aiModel });
      const result = await runCoachAnalysis(selectedDoc, provider, {
        onProgress: (p) => setAnalysisProgress(p.message),
        forceRefresh: true,
      });

      const updatedAnalysis: CoachAnalysis = {
        ...result,
        docId: selectedDoc.id,
        overview: [
          `Analyzed ${result.concepts?.length || 0} core syllabus concepts for this document.`,
          `Estimated exam intensity: High`,
          `Identified ${result.weakSpots?.length || 0} critical blindspots to address immediately.`
        ],
        realityVerdict: result.realityCheck || 'Master core formulas and concepts before attempting past exam papers.',
        traps: result.weakSpots || [],
        actionPlan: (result.plan || []).map(p => `Day ${p.day}: ${p.tasks.join(', ')}`),
      };

      await db.coachAnalyses.put(updatedAnalysis);
      setAnalysis(updatedAnalysis);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAnalysisError(err?.message || 'AI Analysis failed. Check your API key and connection.');
    } finally {
      setLoading(false);
      setAnalysisProgress('');
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaPrompt.trim() || isAsking) return;
    const q = qaPrompt.trim();
    setQaPrompt('');
    setIsAsking(true);

    if (!groqApiKey.trim()) {
      setQaLog(prev => [
        ...prev,
        {
          q,
          a: 'Groq API Key missing. Please go to Settings to add your free Groq API key.',
          error: true,
        }
      ]);
      setIsAsking(false);
      return;
    }

    try {
      const provider = new GroqProvider({ apiKey: groqApiKey, model: aiModel });
      const docContext = selectedDoc?.body || selectedDoc?.title || 'Study Material';
      const answer = await provider.complete({
        system: 'You are StudyVault Blunt AI Coach. Give a direct, punchy, exam-oriented explanation. Point out common traps and what examiners expect.',
        user: `Context: ${docContext.slice(0, 3000)}

Student Question: ${q}`,
        maxTokens: 1000,
      });

      setQaLog(prev => [
        ...prev,
        {
          q,
          a: answer.trim(),
        }
      ]);
    } catch (err: any) {
      setQaLog(prev => [
        ...prev,
        {
          q,
          a: `Error: ${err?.message || 'Failed to reach AI Coach.'}`,
          error: true,
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const getItemsForTab = (): string[] => {
    if (!analysis) return [];
    switch (activeTab) {
      case 'overview':
        return analysis.overview || ['Analysis ready for inspection.'];
      case 'reality':
        return [analysis.realityVerdict || analysis.realityCheck || 'No reality check generated yet.'];
      case 'concepts':
        return ((analysis.concepts as any[]) || []).map((c: any) =>
          typeof c === 'string'
            ? c
            : `${c.name || 'Concept'} (Priority ${c.importance || 3}/5): ${c.why || ''}`
        );
      case 'traps':
        return analysis.traps || analysis.weakSpots || [];
      case 'action':
        return analysis.actionPlan || (analysis.plan || []).map(p => `Day ${p.day}: ${p.tasks.join(', ')}`);
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] pb-28">
      <TopAppBar
        title="AI Study Coach"
        subtitle={selectedDoc ? selectedDoc.title : 'Select a document'}
        trailingAction={
          <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-500 flex items-center gap-1 text-xs font-semibold px-2.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Blunt Mode</span>
          </div>
        }
      />

      <main className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        {documents.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {documents.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDoc(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDoc?.id === d.id
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                    : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        )}

        {selectedDoc && (
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <ButtonGroup
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'reality', label: 'Reality Check' },
                { value: 'concepts', label: 'Key Concepts' },
                { value: 'traps', label: 'Exam Traps' },
                { value: 'action', label: 'Action Plan' }
              ]}
              value={activeTab}
              onChange={(val) => setActiveTab(val as AnalysisTabKey)}
            />
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center bg-[var(--md-sys-color-surface-container)] rounded-3xl">
            <LoadingIndicator size={48} />
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-3 font-mono">
              {analysisProgress || 'Synthesizing Groq AI coaching breakdown...'}
            </p>
          </div>
        ) : analysis ? (
          <AnalysisCard
            type={activeTab}
            title={
              activeTab === 'overview'
                ? 'Document Diagnostic'
                : activeTab === 'reality'
                ? 'Brutal Reality Check'
                : activeTab === 'concepts'
                ? 'Core Concepts to Master'
                : activeTab === 'traps'
                ? 'Common Exam Traps'
                : '3-Day Rapid Recovery Plan'
            }
            items={getItemsForTab()}
            realityVerdict={activeTab === 'reality' ? (analysis.realityVerdict || analysis.realityCheck) : undefined}
          />
        ) : selectedDoc ? (
          <div className="p-8 text-center bg-[var(--md-sys-color-surface-container)] rounded-3xl space-y-3">
            <Sparkles className="w-10 h-10 mx-auto text-[var(--md-sys-color-primary)] mb-1" />
            <h3 className="font-bold text-base text-[var(--md-sys-color-on-surface)]">
              No Analysis Generated Yet
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-md mx-auto">
              Run Groq AI Coach to extract core exam concepts, reality check warnings, and recovery action plans for "{selectedDoc.title}".
            </p>

            {analysisError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            <div className="flex justify-center gap-2 pt-1">
              <Button
                variant="filled"
                size="md"
                onClick={handleGenerateAnalysis}
                leadingIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyze Document
              </Button>
              {!groqApiKey && onNavigateTab && (
                <Button
                  variant="tonal"
                  size="md"
                  onClick={() => onNavigateTab('settings')}
                  leadingIcon={<Key className="w-4 h-4" />}
                >
                  Configure API Key
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--md-sys-color-surface-container)] rounded-3xl">
            <Brain className="w-10 h-10 mx-auto text-[var(--md-sys-color-outline)] mb-2" />
            <p className="font-semibold">No Document Selected</p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
              Upload notes or PDFs to your study shelf to generate blunt AI study coaching.
            </p>
          </div>
        )}

        {/* Interactive Direct Q&A with Coach */}
        {selectedDoc && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] px-1 font-mono">
              <MessageSquare className="w-4 h-4" />
              <span>Direct Coach Q&A</span>
            </div>

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={qaPrompt}
                onChange={(e) => setQaPrompt(e.target.value)}
                placeholder="Ask blunt question about this syllabus..."
                className="flex-1 px-4 py-2.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
              />
              <Button
                type="submit"
                variant="filled"
                size="sm"
                disabled={isAsking || !qaPrompt.trim()}
                leadingIcon={<Send className="w-3.5 h-3.5" />}
              >
                Ask
              </Button>
            </form>

            {qaLog.length > 0 && (
              <div className="space-y-2 pt-1">
                {qaLog.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      item.error
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-[var(--md-sys-color-surface-container-low)] border-[var(--md-sys-color-outline-variant)]'
                    }`}
                  >
                    <p className="font-bold text-[var(--md-sys-color-primary)]">Q: {item.q}</p>
                    <p className="text-[var(--md-sys-color-on-surface)] leading-relaxed whitespace-pre-wrap">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
