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

export interface SubjectRevision {
  subject: Subject;
  chapters: Chapter[]; // Chapters to study for this subject on this day
}

export interface RevisionSchedule {
  date: string; // ISO date string
  subjects: SubjectRevision[];
}

export interface ExamSchedule {
  examDate: string; // ISO date string
  subjectsPerDay: number;
  schedule: RevisionSchedule[];
}

const STORAGE_KEY = 'study_plan_subjects';
const EXAM_SCHEDULE_KEY = 'study_plan_exam_schedule';

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

// Exam Schedule Functions
export function getExamSchedule(): ExamSchedule | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(EXAM_SCHEDULE_KEY);
    if (!data) return null;
    
    const schedule: ExamSchedule = JSON.parse(data);
    
    // Validate and migrate old schedule format if needed
    if (schedule && schedule.schedule) {
      schedule.schedule = schedule.schedule.filter(day => {
        if (!day || !day.subjects) return false;
        
        // Migrate old format (subjects as Subject[]) to new format (subjects as SubjectRevision[])
        day.subjects = day.subjects.map((item: any) => {
          // If it's the old format (just a Subject)
          if (item.id && item.name && Array.isArray(item.chapters)) {
            return {
              subject: item,
              chapters: item.chapters, // Use all chapters for old format
            };
          }
          // If it's already the new format (SubjectRevision)
          if (item.subject && item.chapters) {
            // Validate that subject exists and has chapters
            if (!item.subject.chapters || item.subject.chapters.length === 0) {
              return null;
            }
            return item;
          }
          return null;
        }).filter(Boolean);
        
        return day.subjects.length > 0;
      });
    }
    
    return schedule;
  } catch (error) {
    console.error('Error reading exam schedule:', error);
    return null;
  }
}

export function saveExamSchedule(schedule: ExamSchedule): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(EXAM_SCHEDULE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error('Error saving exam schedule:', error);
  }
}

export function clearExamSchedule(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXAM_SCHEDULE_KEY);
}

// Generate spaced repetition schedule with chapter allocation
export function generateSpacedSchedule(examDate: string, subjectsPerDay: number = 2): ExamSchedule {
  const subjects = getSubjects().filter(s => s.chapters.length > 0);
  
  if (subjects.length === 0) {
    return { examDate, subjectsPerDay, schedule: [] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  
  const daysUntilExam = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExam <= 0) {
    return { examDate, subjectsPerDay, schedule: [] };
  }

  // Validate subjectsPerDay
  const validSubjectsPerDay = Math.max(1, Math.min(subjectsPerDay, subjects.length));
  
  // Create array of all dates from today to exam date
  const dates: Date[] = [];
  for (let i = 0; i < daysUntilExam; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  // Calculate how many times each subject should appear
  const totalSlots = daysUntilExam * validSubjectsPerDay;
  const appearancesPerSubject = Math.floor(totalSlots / subjects.length);
  let remainder = totalSlots % subjects.length;
  
  // Track subject appearances
  const subjectAppearances = new Map<string, number>();
  subjects.forEach(s => {
    subjectAppearances.set(s.id, appearancesPerSubject + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder--;
  });

  // Initialize schedule
  const schedule: RevisionSchedule[] = [];
  for (let i = 0; i < daysUntilExam; i++) {
    schedule.push({
      date: dates[i].toISOString().split('T')[0],
      subjects: [],
    });
  }

  // Distribute subjects evenly across days
  const subjectQueue = [...subjects];
  let dayIndex = 0;
  
  // First pass: Distribute subjects evenly
  while (subjectQueue.length > 0) {
    for (let slot = 0; slot < validSubjectsPerDay && subjectQueue.length > 0; slot++) {
      const subject = subjectQueue.shift()!;
      const appearances = subjectAppearances.get(subject.id) || 0;
      
      // Find the best day to place this subject (even spacing)
      let bestDay = dayIndex;
      let minDistance = Infinity;
      
      for (let d = 0; d < daysUntilExam; d++) {
        const day = schedule[d];
        const isAlreadyPlaced = day.subjects.some(s => s.subject.id === subject.id);
        
        if (!isAlreadyPlaced && day.subjects.length < validSubjectsPerDay) {
          // Calculate spacing score - prefer days that maintain even distribution
          const daysSinceLast = d - dayIndex;
          const idealSpacing = Math.floor(daysUntilExam / appearances);
          const distance = Math.abs(daysSinceLast - idealSpacing);
          
          if (distance < minDistance) {
            minDistance = distance;
            bestDay = d;
          }
        }
      }
      
      // Allocate chapters for this subject on this day
      const daySchedule = schedule[bestDay];
      
      // Safety check
      if (!daySchedule || !subject || !subject.chapters || subject.chapters.length === 0) {
        continue;
      }
      
      const chaptersPerDay = Math.ceil(subject.chapters.length / appearances);
      const startChapter = Math.max(0, (subjectAppearances.get(subject.id)! - appearances) * chaptersPerDay);
      const chaptersToStudy = subject.chapters.slice(
        startChapter,
        startChapter + chaptersPerDay
      );
      
      daySchedule.subjects.push({
        subject,
        chapters: chaptersToStudy.length > 0 ? chaptersToStudy : subject.chapters.slice(0, 1),
      });
      
      // Update appearances remaining
      const remaining = (subjectAppearances.get(subject.id) || 0) - 1;
      subjectAppearances.set(subject.id, remaining);
      
      if (remaining > 0) {
        subjectQueue.push(subject);
      }
    }
    
    dayIndex = (dayIndex + 1) % daysUntilExam;
  }

  // Second pass: Add revision sessions (spaced repetition)
  // Revisit subjects with intervals that decrease as exam approaches
  for (let day = 0; day < daysUntilExam; day++) {
    const daysFromExam = daysUntilExam - day;
    const daySchedule = schedule[day];
    
    // Calculate review intervals based on spaced repetition
    if (daysFromExam > 7) {
      // For early days, review every ~3-5 days
      const reviewInterval = Math.floor(daysUntilExam / (subjects.length * 1.5));
      const reviewDay = day - reviewInterval;
      
      if (reviewDay >= 0 && daySchedule && daySchedule.subjects.length < validSubjectsPerDay) {
        const reviewDaySchedule = schedule[reviewDay];
        if (reviewDaySchedule && reviewDaySchedule.subjects) {
          reviewDaySchedule.subjects.forEach(({ subject, chapters }) => {
            if (subject && chapters && daySchedule.subjects.length < validSubjectsPerDay) {
              const alreadyScheduled = daySchedule.subjects.some(s => s.subject && s.subject.id === subject.id);
              if (!alreadyScheduled) {
                // Review a subset of chapters
                const reviewChapters = chapters && chapters.length > 2 
                  ? chapters.slice(0, Math.ceil(chapters.length / 2))
                  : chapters || [];
                
                if (reviewChapters.length > 0) {
                  daySchedule.subjects.push({
                    subject,
                    chapters: reviewChapters,
                  });
                }
              }
            }
          });
        }
      }
    } else {
      // Final week: ensure all subjects are reviewed
      const scheduledSubjectIds = new Set(daySchedule.subjects.map(s => s.subject.id));
      const missingSubjects = subjects.filter(s => !scheduledSubjectIds.has(s.id));
      
      if (missingSubjects.length > 0 && daySchedule && daySchedule.subjects.length < validSubjectsPerDay) {
        const subjectToAdd = missingSubjects[0];
        if (subjectToAdd && subjectToAdd.chapters && subjectToAdd.chapters.length > 0) {
          const remainingSlots = validSubjectsPerDay - daySchedule.subjects.length;
          
          if (remainingSlots > 0) {
            // Add all chapters for final review
            daySchedule.subjects.push({
              subject: subjectToAdd,
              chapters: subjectToAdd.chapters,
            });
          }
        }
      }
    }
  }

  // Third pass: Ensure even distribution in final days
  const lastWeek = schedule.slice(-7);
  subjects.forEach(subject => {
    if (!subject || !subject.chapters || subject.chapters.length === 0) return;
    
    const appearsInLastWeek = lastWeek.some(day =>
      day && day.subjects && day.subjects.some(s => s.subject && s.subject.id === subject.id)
    );
    
    if (!appearsInLastWeek && lastWeek.length > 0) {
      // Find day with least subjects
      const validDays = lastWeek.filter(day => day && day.subjects);
      if (validDays.length === 0) return;
      
      const leastLoaded = validDays.reduce((min, day) =>
        day.subjects.length < min.subjects.length ? day : min
      );
      
      if (leastLoaded && leastLoaded.subjects.length < validSubjectsPerDay) {
        leastLoaded.subjects.push({
          subject,
          chapters: subject.chapters, // All chapters for final review
        });
      }
    }
  });

  return {
    examDate,
    subjectsPerDay: validSubjectsPerDay,
    schedule: schedule.filter(day => day.subjects.length > 0),
  };
}

