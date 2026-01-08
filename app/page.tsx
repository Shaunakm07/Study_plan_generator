'use client';

import { useState, useEffect } from 'react';
import { 
  getSubjects, 
  addSubject, 
  deleteSubject, 
  addChapter, 
  deleteChapter, 
  getRandomChapter,
  generateSpacedSchedule,
  getExamSchedule,
  saveExamSchedule,
  clearExamSchedule,
  type Subject,
  type Chapter,
  type ExamSchedule,
  type RevisionSchedule,
  type SubjectRevision
} from './lib/storage';

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [randomResult, setRandomResult] = useState<{ subject: Subject; chapter: Chapter } | null>(null);
  const [showRandomResult, setShowRandomResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [examSchedule, setExamSchedule] = useState<ExamSchedule | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [subjectsPerDay, setSubjectsPerDay] = useState(2);

  // Load subjects and exam schedule on mount
  useEffect(() => {
    setSubjects(getSubjects());
    const savedSchedule = getExamSchedule();
    if (savedSchedule) {
      setExamSchedule(savedSchedule);
      setExamDate(savedSchedule.examDate);
      setSubjectsPerDay(savedSchedule.subjectsPerDay || 2);
      setShowCalendar(true);
    }
  }, []);

  // Note: Schedule doesn't auto-regenerate. User must click "Generate Schedule" to update.
  // This prevents infinite loops and gives user control over when to regenerate.

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const subject = addSubject(newSubjectName);
      setSubjects(getSubjects());
      setNewSubjectName('');
      setSelectedSubject(subject.id);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject and all its chapters?')) {
      deleteSubject(subjectId);
      setSubjects(getSubjects());
      if (selectedSubject === subjectId) {
        setSelectedSubject(null);
      }
    }
  };

  const handleAddChapter = () => {
    if (selectedSubject && newChapterName.trim()) {
      addChapter(selectedSubject, newChapterName);
      setSubjects(getSubjects());
      setNewChapterName('');
    }
  };

  const handleDeleteChapter = (subjectId: string, chapterId: string) => {
    deleteChapter(subjectId, chapterId);
    setSubjects(getSubjects());
  };

  const handleRandomSelect = () => {
    setIsAnimating(true);
    setShowRandomResult(false);
    
    // Animate the selection
    setTimeout(() => {
      const result = getRandomChapter();
      setRandomResult(result);
      setShowRandomResult(true);
      setIsAnimating(false);
    }, 300);
  };

  const handleGenerateSchedule = () => {
    if (!examDate || subjects.filter(s => s.chapters.length > 0).length === 0) {
      alert('Please enter an exam date and add subjects with chapters first.');
      return;
    }
    
    const schedule = generateSpacedSchedule(examDate, subjectsPerDay);
    setExamSchedule(schedule);
    saveExamSchedule(schedule);
    setShowCalendar(true);
  };

  const handleClearSchedule = () => {
    if (confirm('Are you sure you want to clear the exam schedule?')) {
      clearExamSchedule();
      setExamSchedule(null);
      setExamDate('');
      setShowCalendar(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilExam = (): number => {
    if (!examSchedule) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examSchedule.examDate);
    exam.setHours(0, 0, 0, 0);
    return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isToday = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isPast = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);
  const totalChapters = subjects.reduce((sum, s) => sum + s.chapters.length, 0);
  const hasChapters = totalChapters > 0;
  const subjectsWithChapters = subjects.filter(s => s.chapters.length > 0);

  return (
    <div className="min-h-screen bg-[#0f0f0f] relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-block mb-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Study Plan Generator
              </span>
          </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-50" />
          </div>
          <p className="text-[#b3b3b3] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Organize your subjects and chapters, then let us randomly select what to study next
          </p>
          {totalChapters > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-[#b3b3b3]">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {totalChapters} {totalChapters === 1 ? 'chapter' : 'chapters'} ready
            </div>
          )}
        </header>

        {/* Random Chapter Selection Card */}
        <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 animate-fade-in shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/15 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#f5f5f5] mb-2">
                Random Chapter Selector
              </h2>
              <p className="text-sm text-[#808080]">
                Discover your next study focus
              </p>
            </div>
            <button
              onClick={handleRandomSelect}
              disabled={!hasChapters || isAnimating}
              className="group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-blue-500/25 min-w-[200px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAnimating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Selecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Select Random Chapter
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
            </button>
          </div>
          
          {showRandomResult && randomResult && (
            <div className="animate-scale-in mt-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-violet-500/10 border border-blue-500/20 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#b3b3b3] mb-2 uppercase tracking-wider">Your random chapter</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                    {randomResult.chapter.name}
                  </h3>
                  <p className="text-base text-[#b3b3b3]">
                    from <span className="font-semibold text-cyan-400">{randomResult.subject.name}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {showRandomResult && !randomResult && (
            <div className="animate-fade-in mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No chapters available. Please add subjects and chapters first.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Subjects */}
          <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/15 transition-all duration-300 animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#f5f5f5]">
                Subjects
              </h2>
              {subjects.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                  {subjects.length}
                </span>
              )}
            </div>

            {/* Add Subject Form */}
            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="Enter subject name..."
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-[#f5f5f5] placeholder:text-[#808080] outline-none transition-all duration-200"
                />
                <button
                  onClick={handleAddSubject}
                  disabled={!newSubjectName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Subjects List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {subjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/5">
                    <svg className="w-8 h-8 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-[#808080] text-sm">
                    No subjects yet. Add your first subject above!
                  </p>
                </div>
              ) : (
                subjects.map((subject, index) => (
                  <div
                    key={subject.id}
                    className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer animate-fade-in ${
                      selectedSubject === subject.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'bg-[#1a1a1a] border-white/10 hover:border-white/20 hover:bg-[#242424]'
                    }`}
                    onClick={() => setSelectedSubject(subject.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#f5f5f5] mb-1 truncate">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-[#808080]">
                          {subject.chapters.length} {subject.chapters.length === 1 ? 'chapter' : 'chapters'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject.id);
                        }}
                        className="ml-4 p-2 text-[#808080] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete subject"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Chapters */}
          <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/15 transition-all duration-300 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#f5f5f5]">
                Chapters
              </h2>
              {selectedSubjectData && selectedSubjectData.chapters.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                  {selectedSubjectData.chapters.length}
                </span>
              )}
            </div>

            {selectedSubjectData ? (
              <>
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                  <p className="text-sm text-[#b3b3b3]">
                    Adding chapters for <span className="font-semibold text-violet-400">{selectedSubjectData.name}</span>
                  </p>
                </div>

                {/* Add Chapter Form */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                      placeholder="Enter chapter/topic name..."
                      className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-[#f5f5f5] placeholder:text-[#808080] outline-none transition-all duration-200"
                    />
                    <button
                      onClick={handleAddChapter}
                      disabled={!newChapterName.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-400 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-violet-500/25"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {selectedSubjectData.chapters.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/5">
                        <svg className="w-8 h-8 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-[#808080] text-sm">
                        No chapters yet. Add your first chapter above!
                      </p>
                    </div>
                  ) : (
                    selectedSubjectData.chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className="group flex items-center justify-between p-3.5 bg-[#1a1a1a] rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#242424] transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <span className="text-[#f5f5f5] font-medium text-sm flex-1 min-w-0 truncate">
                          {chapter.name}
                        </span>
                        <button
                          onClick={() => handleDeleteChapter(selectedSubjectData.id, chapter.id)}
                          className="ml-3 p-1.5 text-[#808080] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete chapter"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/5">
                  <svg className="w-10 h-10 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-[#808080] text-base mb-2">Select a subject to add chapters</p>
                <p className="text-[#666666] text-sm">Choose a subject from the left panel to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Exam Date & Schedule Section - Below Subjects/Chapters */}
        <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 mt-8 sm:mt-10 animate-fade-in shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/15 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#f5f5f5] mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Spaced Revision Schedule
              </h2>
              <p className="text-sm text-[#808080] ml-0 sm:ml-14">
                Set your exam date and get a personalized study calendar with chapter allocation
              </p>
            </div>
            {examSchedule && (
              <button
                onClick={handleClearSchedule}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-sm font-medium border border-red-500/20 hover:border-red-500/40"
              >
                Clear Schedule
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-[#b3b3b3] mb-2">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-[#f5f5f5] outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm text-[#b3b3b3] mb-2">Subjects Per Day</label>
              <input
                type="number"
                value={subjectsPerDay}
                onChange={(e) => setSubjectsPerDay(Math.max(1, Math.min(parseInt(e.target.value) || 1, subjectsWithChapters.length)))}
                min={1}
                max={subjectsWithChapters.length}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-[#f5f5f5] outline-none transition-all duration-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateSchedule}
                disabled={!examDate || subjectsWithChapters.length === 0}
                className="w-full px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-violet-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:via-cyan-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
              >
                Generate Schedule
              </button>
            </div>
          </div>

          {examSchedule && showCalendar && (
            <div className="mt-8 animate-scale-in">
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-violet-500/10 border border-blue-500/20 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[#b3b3b3] uppercase tracking-wider mb-1">Exam Date</p>
                      <p className="text-xl font-semibold text-[#f5f5f5]">{formatDate(examSchedule.examDate)}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center sm:text-right">
                      <p className="text-xs text-[#b3b3b3] uppercase tracking-wider mb-1">Days Remaining</p>
                      <p className="text-2xl font-bold text-cyan-400">{getDaysUntilExam()}</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-xs text-[#b3b3b3] uppercase tracking-wider mb-1">Per Day</p>
                      <p className="text-2xl font-bold text-violet-400">{examSchedule.subjectsPerDay}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2">
                {examSchedule.schedule.map((day: RevisionSchedule, index: number) => {
                  const dayDate = new Date(day.date);
                  const isTodayDate = isToday(day.date);
                  const isPastDate = isPast(day.date);
                  const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                  const month = dayDate.toLocaleDateString('en-US', { month: 'short' });
                  const dayNum = dayDate.getDate();
                  
                  return (
                    <div
                      key={day.date}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 animate-fade-in overflow-hidden ${
                        isTodayDate
                          ? 'bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-violet-500/20 border-blue-500/50 shadow-2xl shadow-blue-500/20'
                          : isPastDate
                          ? 'bg-[#1a1a1a] border-white/5 opacity-50'
                          : 'bg-[#1a1a1a] border-white/10 hover:border-white/20 hover:bg-[#242424] hover:shadow-lg'
                      }`}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      {/* Date Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`relative w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                            isTodayDate
                              ? 'bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg'
                              : isPastDate
                              ? 'bg-[#242424]'
                              : 'bg-[#242424] group-hover:bg-[#2a2a2a]'
                          }`}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${
                              isTodayDate ? 'text-white/80' : 'text-[#808080]'
                            }`}>
                              {dayOfWeek}
                            </span>
                            <span className={`text-2xl font-bold ${
                              isTodayDate ? 'text-white' : 'text-[#f5f5f5]'
                            }`}>
                              {dayNum}
                            </span>
                            <span className={`text-[10px] font-medium uppercase ${
                              isTodayDate ? 'text-white/70' : 'text-[#666666]'
                            }`}>
                              {month}
                            </span>
                          </div>
                          <div>
                            <p className={`font-semibold text-lg ${
                              isTodayDate ? 'text-cyan-400' : 'text-[#f5f5f5]'
                            }`}>
                              {dayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </p>
                            {isTodayDate && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                Today
                              </span>
                            )}
                            {isPastDate && (
                              <span className="text-xs text-[#808080] font-medium mt-1 inline-block">Past</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-violet-400 text-sm font-semibold">
                              {day.subjects.length} {day.subjects.length === 1 ? 'subject' : 'subjects'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Subjects with Chapters */}
                      <div className="space-y-3">
                        {day.subjects.map((subjectRevision) => {
                          if (!subjectRevision || !subjectRevision.subject || !subjectRevision.subject.chapters) {
                            return null;
                          }
                          
                          const totalChaptersForSubject = subjectRevision.subject.chapters.length;
                          const chaptersToStudy = subjectRevision.chapters ? subjectRevision.chapters.length : 0;
                          const percentage = totalChaptersForSubject > 0 
                            ? Math.round((chaptersToStudy / totalChaptersForSubject) * 100)
                            : 0;
                          
                          return (
                            <div
                              key={subjectRevision.subject.id}
                              className="p-4 rounded-xl bg-[#242424] border border-white/5 hover:border-white/10 transition-all duration-200"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-[#f5f5f5] mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                                    {subjectRevision.subject.name}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-[#808080]">
                                      {chaptersToStudy} of {totalChaptersForSubject} chapters
                                    </span>
                                    <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden max-w-[100px]">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-cyan-400 font-medium">{percentage}%</span>
                                  </div>
                                </div>
                              </div>
                              {subjectRevision.chapters && subjectRevision.chapters.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {subjectRevision.chapters.map((chapter) => (
                                    chapter ? (
                                      <span
                                        key={chapter.id}
                                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-[#f5f5f5] text-sm font-medium"
                                      >
                                        {chapter.name}
                                      </span>
                                    ) : null
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {examSchedule && examSchedule.schedule.length === 0 && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No subjects with chapters available. Add subjects and chapters first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
