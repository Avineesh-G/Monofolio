import React, { useEffect, useState } from 'react';
import { db, Document, CoachAnalysis } from '../../db';
import { TopAppBar, ButtonGroup, Button, LoadingIndicator } from '../../components/m3e';
import { AnalysisCard, AnalysisTabKey } from '../../components/m3e/cards';
import { Brain, Flame, MessageSquare, Send } from 'lucide-react';

interface CoachScreenProps {
  initialDocId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const CoachScreen: React.FC<CoachScreenProps> = ({
  initialDocId
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AnalysisTabKey>('overview');
  const [qaPrompt, setQaPrompt] = useState('');
  const [qaLog, setQaLog] = useState<{ q: string; a: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

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
    if (!selectedDoc) return;
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        const existing = await db.coachAnalyses.where('docId').equals(selectedDoc.id).first();
        if (existing) {
          setAnalysis(existing);
        } else {
          const mockAnalysis: CoachAnalysis = {
            id: 'mock-' + selectedDoc.id,
            itemId: selectedDoc.id,
            docId: selectedDoc.id,
            fileHash: selectedDoc.fileHash || 'mock-hash',
            promptVersion: 1,
            concepts: [
              { name: 'Core Architecture', importance: 5, why: 'Foundational framework for all subsequent chapters.' },
              { name: 'State Management Patterns', importance: 4, why: 'Guarantees reliable offline synchronization.' },
              { name: 'Leitner Spacing Matrix', importance: 5, why: 'Ensures optimal memory retention with minimum effort.' }
            ],
            weakSpots: ['Confusing synchronous vs asynchronous state', 'Skipping edge cases in error recovery'],
            learningOrder: ['Core Architecture', 'State Management Patterns', 'Leitner Spacing Matrix'],
            plan: [
              { day: 1, tasks: ['Review Core Architecture definitions', 'Complete 10 quiz cards'] },
              { day: 2, tasks: ['Solve past paper questions on Leitner Spacing'] }
            ],
            realityCheck: 'You understand high-level concepts, but your recall on specific equations is weak. Focus 80% of your time on practice questions instead of re-reading slides.',
            overview: [
              'Primary document domain identified.',
              'Estimated mastery requirement: High (Semester Exam Core).',
              'Key exam traps flagged in section 3.'
            ],
            realityVerdict: 'Stop passive reading. You have a 45% error rate on numerical questions.',
            traps: [
              'Assuming formulas are given on the exam cover sheet.',
              'Confusing unit conversions between metric and imperial.',
              'Over-indexing on introductory definitions while skipping advanced derivations.'
            ],
            actionPlan: [
              'Day 1: Memorize the 4 core formulas and derivation steps.',
              'Day 2: Run a 15-card Leitner quiz session.',
              'Day 3: Write out full answers under 20-minute time constraints.'
            ],
            createdAt: Date.now()
          };
          setAnalysis(mockAnalysis);
        }
      } catch (err) {
        console.error('Failed to load analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [selectedDoc]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaPrompt.trim() || isAsking) return;
    const q = qaPrompt.trim();
    setQaPrompt('');
    setIsAsking(true);

    setTimeout(() => {
      setQaLog(prev => [
        ...prev,
        {
          q,
          a: 'Direct Answer: Focus on the root definition and write the governing equation first. Most examiners award 60% of marks for the correct equation structure alone.'
        }
      ]);
      setIsAsking(false);
    }, 400);
  };

  const getItemsForTab = (): string[] => {
    if (!analysis) return [];
    switch (activeTab) {
      case 'overview':
        return analysis.overview || ['Analysis ready for inspection.'];
      case 'reality':
        return [analysis.realityVerdict || 'No reality check generated yet.'];
      case 'concepts':
        return ((analysis.concepts as any[]) || []).map((c: any) =>
          typeof c === 'string'
            ? c
            : `${c.name || 'Concept'} (Priority ${c.importance || 3}/5): ${c.why || ''}`
        );
      case 'traps':
        return analysis.traps || [];
      case 'action':
        return analysis.actionPlan || [];
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
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

        {loading ? (
          <div className="p-12 text-center">
            <LoadingIndicator size={48} />
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-3">
              Synthesizing Groq AI coaching breakdown...
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
            realityVerdict={activeTab === 'reality' ? analysis.realityVerdict : undefined}
          />
        ) : (
          <div className="p-8 text-center bg-[var(--md-sys-color-surface-container)] rounded-3xl border border-[var(--md-sys-color-outline-variant)]">
            <Brain className="w-10 h-10 mx-auto text-[var(--md-sys-color-outline)] mb-2" />
            <p className="font-semibold">No Document Selected</p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
              Select or upload a document to generate blunt AI study coaching.
            </p>
          </div>
        )}

        {/* Interactive Direct Q&A with Coach */}
        <section className="space-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] px-1">
            <MessageSquare className="w-4 h-4" />
            <span>Direct Coach Q&A</span>
          </div>

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={qaPrompt}
              onChange={(e) => setQaPrompt(e.target.value)}
              placeholder="Ask blunt question about this syllabus..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-sm border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
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
            <div className="space-2 pt-1">
              {qaLog.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs space-y-1.5">
                  <p className="font-bold text-[var(--md-sys-color-primary)]">Q: {item.q}</p>
                  <p className="text-[var(--md-sys-color-on-surface)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
