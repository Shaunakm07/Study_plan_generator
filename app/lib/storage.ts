// Types
export interface Chapter {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

const STORAGE_KEY = 'study_plan_subjects';

// Get all subjects from localStorage
export function getSubjects(): Subject[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// Save subjects to localStorage
export function saveSubjects(subjects: Subject[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Add a new subject
export function addSubject(name: string): Subject {
  const subjects = getSubjects();
  const newSubject: Subject = {
    id: Date.now().toString(),
    name: name.trim(),
    chapters: [],
  };
  subjects.push(newSubject);
  saveSubjects(subjects);
  return newSubject;
}

// Delete a subject
export function deleteSubject(subjectId: string): void {
  const subjects = getSubjects();
  const filtered = subjects.filter((s) => s.id !== subjectId);
  saveSubjects(filtered);
}

// Add a chapter to a subject
export function addChapter(subjectId: string, chapterName: string): Chapter {
  const subjects = getSubjects();
  const subject = subjects.find((s) => s.id === subjectId);
  
  if (!subject) {
    throw new Error('Subject not found');
  }
  
  const newChapter: Chapter = {
    id: Date.now().toString(),
    name: chapterName.trim(),
  };
  
  subject.chapters.push(newChapter);
  saveSubjects(subjects);
  return newChapter;
}

// Delete a chapter from a subject
export function deleteChapter(subjectId: string, chapterId: string): void {
  const subjects = getSubjects();
  const subject = subjects.find((s) => s.id === subjectId);
  
  if (subject) {
    subject.chapters = subject.chapters.filter((c) => c.id !== chapterId);
    saveSubjects(subjects);
  }
}

// Get a random chapter from all subjects
export function getRandomChapter(): { subject: Subject; chapter: Chapter } | null {
  const subjects = getSubjects();
  const allChapters: Array<{ subject: Subject; chapter: Chapter }> = [];
  
  subjects.forEach((subject) => {
    subject.chapters.forEach((chapter) => {
      allChapters.push({ subject, chapter });
    });
  });
  
  if (allChapters.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * allChapters.length);
  return allChapters[randomIndex];
}

