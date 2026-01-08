'use client';

import { useState, useEffect } from 'react';
import { 
  getSubjects, 
  addSubject, 
  deleteSubject, 
  addChapter, 
  deleteChapter, 
  getRandomChapter,
  type Subject,
  type Chapter 
} from './lib/storage';

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [randomResult, setRandomResult] = useState<{ subject: Subject; chapter: Chapter } | null>(null);
  const [showRandomResult, setShowRandomResult] = useState(false);

  // Load subjects on mount
  useEffect(() => {
    setSubjects(getSubjects());
  }, []);

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
    const result = getRandomChapter();
    setRandomResult(result);
    setShowRandomResult(true);
  };

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Study Plan Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Organize your subjects and chapters, then let us randomly select what to study next
          </p>
        </header>

        {/* Random Chapter Selection Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Random Chapter Selector
            </h2>
            <button
              onClick={handleRandomSelect}
              disabled={subjects.every((s) => s.chapters.length === 0)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🎲 Select Random Chapter
            </button>
          </div>
          
          {showRandomResult && randomResult && (
            <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 animate-pulse">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your random chapter:</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {randomResult.chapter.name}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                from <span className="font-semibold text-blue-600 dark:text-blue-400">{randomResult.subject.name}</span>
              </p>
            </div>
          )}

          {showRandomResult && !randomResult && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
              <p className="text-yellow-800 dark:text-yellow-200">
                No chapters available. Please add subjects and chapters first.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Subjects */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Subjects
            </h2>

            {/* Add Subject Form */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="Enter subject name..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition-all"
                />
                <button
                  onClick={handleAddSubject}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Subjects List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {subjects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No subjects yet. Add your first subject above!
                </p>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedSubject === subject.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {subject.chapters.length} {subject.chapters.length === 1 ? 'chapter' : 'chapters'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject.id);
                        }}
                        className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete subject"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Chapters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Chapters
            </h2>

            {selectedSubjectData ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add chapters for <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedSubjectData.name}</span>
                </p>

                {/* Add Chapter Form */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                      placeholder="Enter chapter/topic name..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition-all"
                    />
                    <button
                      onClick={handleAddChapter}
                      className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSubjectData.chapters.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No chapters yet. Add your first chapter above!
                    </p>
                  ) : (
                    selectedSubjectData.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="text-gray-800 dark:text-white font-medium">
                          {chapter.name}
                        </span>
                        <button
                          onClick={() => handleDeleteChapter(selectedSubjectData.id, chapter.id)}
                          className="ml-4 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete chapter"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Select a subject to add chapters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
