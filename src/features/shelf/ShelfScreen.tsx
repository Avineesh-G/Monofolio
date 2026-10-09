import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { db, Semester, Subject, Topic, Item } from '../../db';
import { itemsRepo, semestersRepo, subjectsRepo, topicsRepo } from '../../db/repos';
import { filesStorage } from '../../storage/files';
import { computeHash } from '../../lib/hash';
import { TopAppBar, SheetCard, Button, LoadingIndicator } from '../../components/m3e';
import { TopicRow, SubjectCard, DocumentCard } from '../../components/m3e/cards';
import { ShapeBadge } from '../../components/m3e/ShapeBadge';
import { Plus, BookOpen, Layers, Sparkles, FileText, Compass, Check } from 'lucide-react';
import { useMotionPreset } from '../../theme/motion';

interface ShelfScreenProps {
  onOpenSubject?: (subjectId: string) => void;
  onOpenTopic?: (topicId: string) => void;
  onOpenDocument?: (docId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ShelfScreen: React.FC<ShelfScreenProps> = ({
  onOpenTopic,
  onOpenDocument,
  onNavigateTab,
}) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectDocs, setSubjectDocs] = useState<Item[]>([]);
  const [subjectDocCounts, setSubjectDocCounts] = useState<Map<string, number>>(new Map());
  const [subjectTopicCounts, setSubjectTopicCounts] = useState<Map<string, number>>(new Map());
  
  // Filters
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'note' | 'link'>('all');
  
  // Modals
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState('');
  
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#d0bcff');

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalTab, setDocModalTab] = useState<'note' | 'link'>('note');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocBody, setNewDocBody] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const motionPreset = useMotionPreset();

  const loadShelfData = async () => {
    try {
      const sems = await db.semesters.toArray();
      setSemesters(sems);
      if (sems.length > 0 && !selectedSemId) {
        setSelectedSemId(sems[0].id);
      }
    } catch (err) {
      console.error('Failed to load semesters:', err);
    }
  };

  useEffect(() => {
    loadShelfData();
  }, []);

  useEffect(() => {
    if (!selectedSemId) return;
    const loadSubjectsForSemester = async () => {
      try {
        const subjs = await db.subjects.where('semesterId').equals(selectedSemId).toArray();
        setSubjects(subjs);
        if (subjs.length > 0) {
          setSelectedSubject(subjs[0]);
        } else {
          setSelectedSubject(null);
        }

        const docCounts = new Map<string, number>();
        const topCounts = new Map<string, number>();
        for (const s of subjs) {
          const dCount = await db.documents.where('subjectId').equals(s.id).count();
          const tCount = await db.topics.where('subjectId').equals(s.id).count();
          docCounts.set(s.id, dCount);
          topCounts.set(s.id, tCount);
        }
        setSubjectDocCounts(docCounts);
        setSubjectTopicCounts(topCounts);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjectsForSemester();
  }, [selectedSemId]);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSubjectDocs([]);
      return;
    }
    const loadSubjectDetails = async () => {
      try {
        const topList = await db.topics.where('subjectId').equals(selectedSubject.id).toArray();
        setTopics(topList);

        const docs = await db.documents.where('subjectId').equals(selectedSubject.id).toArray();
        setSubjectDocs(docs);
      } catch (err) {
        console.error('Failed to load subject details:', err);
      }
    };
    loadSubjectDetails();
  }, [selectedSubject]);

  // Actions
  const handleCreateSemester = async () => {
    if (!newSemesterName.trim()) return;
    const sem = await semestersRepo.create(newSemesterName.trim());
    setNewSemesterName('');
    setIsSemesterModalOpen(false);
    await loadShelfData();
    setSelectedSemId(sem.id);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim() || !selectedSemId) return;
    const subj = await subjectsRepo.create(selectedSemId, newSubjectName.trim(), newSubjectColor, 'BookOpen');
    setNewSubjectName('');
    setIsSubjectModalOpen(false);
    const subjs = await db.subjects.where('semesterId').equals(selectedSemId).toArray();
    setSubjects(subjs);
    setSelectedSubject(subj);
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim() || !selectedSubject) return;
    await topicsRepo.create(selectedSubject.id, newTopicName.trim());
    setNewTopicName('');
    setIsTopicModalOpen(false);
    const topList = await db.topics.where('subjectId').equals(selectedSubject.id).toArray();
    setTopics(topList);
  };

  const handleUploadPdfClick = () => {
    fileInputRef.current?.click();
  };

  const handlePdfFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSubject) return;

    setIsUploadingPdf(true);
    setUploadStatus('Processing PDF in background...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeHash(arrayBuffer);
      const filePath = await filesStorage.saveFile(file.name, arrayBuffer);

      const worker = new Worker(new URL('../../workers/pdf.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = async (event) => {
        const data = event.data;
        if (data.type === 'result') {
          await itemsRepo.create({
            kind: 'pdf',
            title: file.name.replace(/\.[^/.]+$/, ''),
            subjectId: selectedSubject.id,
            filePath,
            fileHash: hash,
            pageCount: data.pageCount,
            textLength: data.charCount,
            thumbnail: data.thumbnail,
          });
          worker.terminate();
          setIsUploadingPdf(false);
          const docs = await db.documents.where('subjectId').equals(selectedSubject.id).toArray();
          setSubjectDocs(docs);
        }
      };
      worker.postMessage({ arrayBuffer, generateThumbnail: true }, [arrayBuffer]);
    } catch (err) {
      console.error('PDF upload error:', err);
      setIsUploadingPdf(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!newDocTitle.trim() || !selectedSubject) return;

    if (docModalTab === 'note') {
      await itemsRepo.create({
        kind: 'note',
        title: newDocTitle.trim(),
        body: newDocBody.trim(),
        subjectId: selectedSubject.id,
      });
    } else {
      let formattedUrl = newDocUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = `https://${formattedUrl}`;
      await itemsRepo.create({
        kind: 'link',
        title: newDocTitle.trim(),
        url: formattedUrl,
        linkNote: newDocBody.trim(),
        subjectId: selectedSubject.id,
      });
    }

    setNewDocTitle('');
    setNewDocBody('');
    setNewDocUrl('');
    setIsDocModalOpen(false);

    const docs = await db.documents.where('subjectId').equals(selectedSubject.id).toArray();
    setSubjectDocs(docs);
  };

  const filteredDocs = useMemo(() => {
    if (filterType === 'all') return subjectDocs;
    return subjectDocs.filter(d => d.kind === filterType);
  }, [subjectDocs, filterType]);

  const activeColor = selectedSubject?.color || '#d0bcff';

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      {/* Hidden PDF file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfFileSelected}
        className="hidden"
      />

      <TopAppBar
        title="Study Shelf"
        subtitle="Syllabus, Semesters & Course Hubs"
        trailingAction={
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3 py-1.5 rounded-2xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Course</span>
          </button>
        }
      />

      <main className="px-4 py-3 space-y-5 max-w-2xl mx-auto">
        {/* Semester Selector & Manager */}
        <section className="space-y-1.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {semesters.map((sem) => {
              const isSelected = selectedSemId === sem.id;
              return (
                <button
                  key={sem.id}
                  onClick={() => setSelectedSemId(sem.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {sem.name}
                </button>
              );
            })}

            <button
              onClick={() => setIsSemesterModalOpen(true)}
              className="px-3 py-2 rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Semester</span>
            </button>
          </div>
        </section>

        {/* Panoramic Active Course Spotlight */}
        {selectedSubject ? (
          <motion.div
            key={selectedSubject.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionPreset.spatialDefault}
            className="p-6 rounded-[32px] bg-gradient-to-br from-surface-container-high to-surface-container shadow-2xl relative overflow-hidden space-y-4"
          >
            <div
              className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeColor }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <ShapeBadge
                  shape="flower"
                  size={52}
                  shapeFill="rgba(255, 255, 255, 0.08)"
                  glow
                  glowColor={activeColor}
                  icon={<BookOpen className="w-6 h-6 stroke-[2.2px]" style={{ color: activeColor }} />}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary">
                    Course Dossier
                  </span>
                  <h2 className="text-xl font-extrabold text-on-surface truncate">
                    {selectedSubject.name}
                  </h2>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {topics.length} syllabus topics &bull; {subjectDocs.length} documents
                  </p>
                </div>
              </div>

              {/* Course Action Buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={handleUploadPdfClick}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload PDF</span>
                </button>
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Add Note/Link</span>
                </button>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateTab && onNavigateTab('quiz')}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-lowest active:scale-95 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Practice Flashcards</span>
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('coach')}
                className="py-2.5 px-3.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-lowest active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Coach Analysis</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="p-8 text-center bg-surface-container rounded-3xl space-y-2">
            <Compass className="w-10 h-10 mx-auto text-primary mb-1" />
            <p className="font-bold text-on-surface">No Courses in this Semester</p>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Add your first course (e.g. Operating Systems, Computer Networks) to begin tracking your syllabus.
            </p>
            <Button variant="filled" size="sm" onClick={() => setIsSubjectModalOpen(true)}>
              + Create Course
            </Button>
          </div>
        )}

        {/* Distinct Course Cards Cluster */}
        {subjects.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant font-mono">
                Enrolled Courses ({subjects.length})
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                + Add Course
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {subjects.map((subj) => (
                <SubjectCard
                  key={subj.id}
                  id={subj.id}
                  name={subj.name}
                  color={subj.color}
                  topicCount={subjectTopicCounts.get(subj.id) || 0}
                  docCount={subjectDocCounts.get(subj.id) || 0}
                  onClick={() => setSelectedSubject(subj)}
                  className={selectedSubject?.id === subj.id ? 'ring-2 ring-primary' : ''}
                />
              ))}
            </div>
          </section>
        )}

        {/* Course Documents & Resources with Filters */}
        {selectedSubject && (
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant font-mono">
                {selectedSubject.name} &bull; Course Documents ({filteredDocs.length})
              </h3>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full text-[11px] font-bold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    filterType === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('pdf')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    filterType === 'pdf' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  PDFs
                </button>
                <button
                  onClick={() => setFilterType('note')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    filterType === 'note' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  Notes
                </button>
              </div>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="p-6 text-center bg-surface-container rounded-2xl space-y-2">
                <p className="text-xs text-on-surface-variant">
                  No documents attached yet to this course.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleUploadPdfClick}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                  >
                    Upload PDF
                  </button>
                  <button
                    onClick={() => setIsDocModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold cursor-pointer"
                  >
                    New Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    kind={doc.kind as any}
                    title={doc.title}
                    subjectName={selectedSubject.name}
                    subjectColor={selectedSubject.color}
                    pageCount={doc.pageCount}
                    isStarred={doc.starred}
                    onClick={() => onOpenDocument && onOpenDocument(doc.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Hierarchical Syllabus Topics */}
        {selectedSubject && (
          <section className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant font-mono">
                Syllabus Topics ({topics.length})
              </h3>
              <button
                onClick={() => setIsTopicModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                + Add Topic
              </button>
            </div>

            <div className="space-y-2">
              {topics.length === 0 ? (
                <div className="p-6 text-center bg-surface-container rounded-2xl space-y-1">
                  <p className="text-xs text-on-surface-variant">
                    No syllabus topics defined for this course.
                  </p>
                </div>
              ) : (
                topics.map((top, idx) => (
                  <TopicRow
                    key={top.id}
                    title={`${idx + 1}. ${top.name}`}
                    flashcardCount={subjectDocs.length}
                    dueCards={0}
                    masteryPercent={top.mastery || 0}
                    isComplete={(top.mastery || 0) >= 75}
                    onClick={() => onOpenTopic && onOpenTopic(top.id)}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* Create Semester Modal */}
      <SheetCard
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        title="Create New Semester"
        subtitle="Organize courses by academic term"
      >
        <div className="space-y-4 py-2">
          <input
            type="text"
            value={newSemesterName}
            onChange={(e) => setNewSemesterName(e.target.value)}
            placeholder="e.g. Semester 2 (Spring), Year 3"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <Button
            variant="filled"
            fullWidth
            onClick={handleCreateSemester}
            disabled={!newSemesterName.trim()}
          >
            Create Semester
          </Button>
        </div>
      </SheetCard>

      {/* Create Subject Modal */}
      <SheetCard
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add New Course"
        subtitle="Attach to the active semester"
      >
        <div className="space-y-4 py-2">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="e.g. Operating Systems, Machine Learning"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant">Course Accent Color</label>
            <div className="flex gap-2">
              {['#d0bcff', '#f5b041', '#7cd992', '#efb8c8', '#70b8ff'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewSubjectColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-sm"
                  style={{ backgroundColor: c }}
                >
                  {newSubjectColor === c && <Check className="w-4 h-4 text-black stroke-[3px]" />}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="filled"
            fullWidth
            onClick={handleCreateSubject}
            disabled={!newSubjectName.trim()}
          >
            Add Course
          </Button>
        </div>
      </SheetCard>

      {/* Create Topic Modal */}
      <SheetCard
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Add Syllabus Topic"
        subtitle={`To ${selectedSubject?.name || 'course'}`}
      >
        <div className="space-y-4 py-2">
          <input
            type="text"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="e.g. Page Replacement Algorithms, TCP Sockets"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <Button
            variant="filled"
            fullWidth
            onClick={handleCreateTopic}
            disabled={!newTopicName.trim()}
          >
            Add Topic Node
          </Button>
        </div>
      </SheetCard>

      {/* Add Document/Note Modal */}
      <SheetCard
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Add to Course"
        subtitle={`Attaching to ${selectedSubject?.name || 'Course'}`}
      >
        <div className="space-y-3.5 py-2">
          <div className="flex p-1 rounded-full bg-surface-container-highest">
            <button
              type="button"
              onClick={() => setDocModalTab('note')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                docModalTab === 'note' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              Study Note
            </button>
            <button
              type="button"
              onClick={() => setDocModalTab('link')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                docModalTab === 'link' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              Resource Link
            </button>
          </div>

          <input
            type="text"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder="Document title..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />

          {docModalTab === 'link' && (
            <input
              type="url"
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          <textarea
            value={newDocBody}
            onChange={(e) => setNewDocBody(e.target.value)}
            placeholder={docModalTab === 'note' ? 'Type markdown notes, formulas...' : 'Why this link was saved...'}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          <Button
            variant="filled"
            fullWidth
            onClick={handleSaveDocument}
            disabled={!newDocTitle.trim() || (docModalTab === 'link' && !newDocUrl.trim())}
          >
            Save to {selectedSubject?.name || 'Course'}
          </Button>
        </div>
      </SheetCard>

      {/* Uploading indicator with WORKING onClose callback */}
      <SheetCard
        isOpen={isUploadingPdf}
        onClose={() => setIsUploadingPdf(false)}
        title="Processing PDF"
      >
        <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
          <LoadingIndicator size={48} />
          <p className="text-xs text-on-surface-variant font-mono">{uploadStatus}</p>
        </div>
      </SheetCard>
    </div>
  );
};
