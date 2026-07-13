import './styles.css';
import {
  buildLearningCourse,
  buildState,
  escapeHtml,
  flattenLessons,
  getAdjacentLessonIds,
  getCompletedCount,
  getLessonById,
  getModuleCompletion,
  getNotesForLesson,
  getProgressPercent,
  getVisibleModules,
  loadLearningState,
  renderMarkdownToHtml,
  saveLearningState,
} from './utils.js';
import {
  addBookmarkLabelAssignment,
  createBookmarkLabel,
  createInterviewQuestions,
  deleteBookmarkLabel,
  deleteInterviewQuestion,
  deleteInterviewQuestionsByCourse,
  fetchBookmarkLabelByName,
  fetchBookmarkLabelAssignments,
  fetchBookmarkLabels,
  fetchInterviewQuestions,
  removeBookmarkLabelAssignmentsByLabel,
  removeBookmarkLabelAssignment,
  updateInterviewQuestion,
  updateInterviewQuestionsByCourse,
} from './supabaseApi.js';

let course = { id: 'archelon-interview-course', title: 'Archelon Learning', modules: [] };
let state = buildState(loadLearningState(), course);
let allQuestionRows = [];
let allBookmarkAssignments = [];
let courseSummaries = [];
let completingLessonId = null;
let bookmarkLabels = [];
let bookmarkPickerOpen = false;
let bookmarkFilterOpen = false;
let addingBookmarkLabel = false;
let selectedLabelColor = '#00c9b1';
let bookmarkLabelDraftName = '';
let bookmarkLabelError = '';
let savingBookmarkLabel = false;
let progressGlowTimer = null;
let editingAnswerId = null;
let answerDraft = '';
let savingAnswer = false;
let answerCopiedTimer = null;
let answerConfirmResolver = null;
let editingLessonId = null;
let lessonEditDraft = null;
let savingLessonEdit = false;
let lessonImportOpen = false;
let lessonImportMode = 'single';
let lessonImportError = '';
let savingLessonImport = false;
let lessonImportDraft = {
  courseName: '',
  question: '',
  answer: '',
  module: 'Basic',
  category: '',
  tags: '',
  json: '',
};
let lessonImportProgress = {
  total: 0,
  completed: 0,
};
let lessonImportStatus = '';
let editingCourseName = null;
let courseNameDraft = '';
let savingCourseName = false;

const labelColors = [
  '#00c9b1',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#ef4444',
  '#14b8a6',
  '#64748b',
];

const bulkLessonJsonSample = JSON.stringify([
  {
    question: '',
    type: 'Basic',
    category: '',
    tags: [],
    answer: '',
  },
], null, 2);

const elements = {
  app: document.getElementById('app'),
  lessonSearchInput: document.getElementById('lessonSearchInput'),
  navMyLearning: document.getElementById('navMyLearning'),
  myLearningChevron: document.getElementById('myLearningChevron'),
  myLearningContent: document.getElementById('myLearningContent'),
  courseList: document.getElementById('courseList'),
  addLessonsButton: document.getElementById('addLessonsButton'),
  learningSidebar: document.getElementById('learningSidebar'),
  lessonColumn: document.querySelector('.lesson-column'),
  sidePanel: document.getElementById('sidePanel'),
  toggleLeftPanelButton: document.getElementById('toggleLeftPanelButton'),
  toggleRightPanelButton: document.getElementById('toggleRightPanelButton'),
  moduleMetaLabel: document.getElementById('moduleMetaLabel'),
  moduleAccordionList: document.getElementById('moduleAccordionList'),
  topbarProgress: document.querySelector('.topbar-progress'),
  topbarCourseName: document.getElementById('topbarCourseName'),
  overallProgressPercent: document.getElementById('overallProgressPercent'),
  overallProgressFill: document.getElementById('overallProgressFill'),
  overallProgressText: document.getElementById('overallProgressText'),
  breadcrumbRow: document.getElementById('breadcrumbRow'),
  lessonCard: document.getElementById('lessonCard'),
  lessonEmptyState: document.getElementById('lessonEmptyState'),
  lessonQuestion: document.getElementById('lessonQuestion'),
  editQuestionButton: document.getElementById('editQuestionButton'),
  deleteLessonButton: document.getElementById('deleteLessonButton'),
  lessonTags: document.getElementById('lessonTags'),
  lessonAnswer: document.getElementById('lessonAnswer'),
  copyAnswerButton: document.getElementById('copyAnswerButton'),
  editAnswerButton: document.getElementById('editAnswerButton'),
  bookmarkLessonButton: document.getElementById('bookmarkLessonButton'),
  selectedBookmarkLabel: document.getElementById('selectedBookmarkLabel'),
  bookmarkLabelPicker: document.getElementById('bookmarkLabelPicker'),
  lessonStatusMicrocopy: document.getElementById('lessonStatusMicrocopy'),
  completeLessonButton: document.getElementById('completeLessonButton'),
  previousLessonButton: document.getElementById('previousLessonButton'),
  nextLessonButton: document.getElementById('nextLessonButton'),
  priorityCluster: document.getElementById('priorityCluster'),
  notesTabButton: document.getElementById('notesTabButton'),
  bookmarksTabButton: document.getElementById('bookmarksTabButton'),
  notesPanel: document.getElementById('notesPanel'),
  bookmarksPanel: document.getElementById('bookmarksPanel'),
  newNoteButton: document.getElementById('newNoteButton'),
  noteEditor: document.getElementById('noteEditor'),
  noteTextarea: document.getElementById('noteTextarea'),
  saveNoteButton: document.getElementById('saveNoteButton'),
  cancelNoteButton: document.getElementById('cancelNoteButton'),
  notesList: document.getElementById('notesList'),
  notesEmptyState: document.getElementById('notesEmptyState'),
  bookmarkLabelFilters: document.getElementById('bookmarkLabelFilters'),
  bookmarksList: document.getElementById('bookmarksList'),
  bookmarksEmptyState: document.getElementById('bookmarksEmptyState'),
  answerConfirmOverlay: document.getElementById('answerConfirmOverlay'),
  answerConfirmTitle: document.getElementById('answerConfirmTitle'),
  answerConfirmText: document.getElementById('answerConfirmText'),
  cancelAnswerConfirmButton: document.getElementById('cancelAnswerConfirmButton'),
  confirmAnswerUpdateButton: document.getElementById('confirmAnswerUpdateButton'),
  lessonImportOverlay: document.getElementById('lessonImportOverlay'),
  closeLessonImportButton: document.getElementById('closeLessonImportButton'),
  singleLessonModeButton: document.getElementById('singleLessonModeButton'),
  bulkLessonModeButton: document.getElementById('bulkLessonModeButton'),
  lessonImportForm: document.getElementById('lessonImportForm'),
};

function persist() {
  saveLearningState(state);
}

function getRowCourseName(row) {
  return row.course_name || 'Claude + Codex Interview Questions';
}

function getCourseSummaries(rows) {
  const summaries = new Map();
  rows.forEach((row) => {
    const courseName = getRowCourseName(row);
    const current = summaries.get(courseName) || { name: courseName, totalLessons: 0 };
    summaries.set(courseName, {
      ...current,
      totalLessons: current.totalLessons + 1,
    });
  });
  return [...summaries.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function resetMarkdownEditors() {
  editingAnswerId = null;
  answerDraft = '';
  savingAnswer = false;
  editingLessonId = null;
  lessonEditDraft = null;
  savingLessonEdit = false;
}

function buildCourseRows(courseName) {
  return allQuestionRows.filter((row) => getRowCourseName(row) === courseName);
}

function setActiveCourse(courseName, options = {}) {
  const nextCourseName = courseSummaries.some((summary) => summary.name === courseName)
    ? courseName
    : courseSummaries[0]?.name;
  const courseRows = buildCourseRows(nextCourseName);
  course = buildLearningCourse(applyBookmarkAssignments(courseRows, allBookmarkAssignments));
  state = buildState({
    ...loadLearningState(),
    selectedCourseName: nextCourseName,
    selectedLessonId: options.keepSelectedLesson ? state.selectedLessonId : null,
  }, course);
  state.selectedCourseName = nextCourseName || course.title;
  state.searchQuery = options.keepSearch ? state.searchQuery : '';
  bookmarkPickerOpen = false;
  bookmarkFilterOpen = false;
  addingBookmarkLabel = false;
  resetMarkdownEditors();
  persist();
}

function rebuildAfterDataChange(preferredCourseName) {
  courseSummaries = getCourseSummaries(allQuestionRows);
  const nextCourseName = courseSummaries.some((summary) => summary.name === preferredCourseName)
    ? preferredCourseName
    : courseSummaries[0]?.name;
  setActiveCourse(nextCourseName, { keepSearch: true });
}

async function deleteCurrentLesson(lesson) {
  const confirmed = await confirmMarkdownUpdate({
    title: 'Delete lesson',
    text: `Delete "${lesson.title}" from this course?`,
    actionLabel: 'Delete Lesson',
  });
  if (!confirmed) return;

  try {
    await deleteInterviewQuestion(lesson.id);
    allQuestionRows = allQuestionRows.filter((row) => row.id !== lesson.id);
    allBookmarkAssignments = allBookmarkAssignments.filter((assignment) => assignment.question_id !== lesson.id);
    rebuildAfterDataChange(state.selectedCourseName);
    render();
  } catch (error) {
    console.error(error);
    alert('Could not delete lesson.');
  }
}

async function deleteCourseByName(courseName) {
  const summary = courseSummaries.find((item) => item.name === courseName);
  if (!summary) return;
  const confirmed = await confirmMarkdownUpdate({
    title: 'Delete course',
    text: `Delete "${summary.name}" and all ${summary.totalLessons} lesson${summary.totalLessons === 1 ? '' : 's'} in it?`,
    actionLabel: 'Delete Course',
  });
  if (!confirmed) return;

  try {
    const courseLessonIds = new Set(allQuestionRows
      .filter((row) => getRowCourseName(row) === courseName)
      .map((row) => row.id));
    await deleteInterviewQuestionsByCourse(courseName);
    allQuestionRows = allQuestionRows.filter((row) => getRowCourseName(row) !== courseName);
    allBookmarkAssignments = allBookmarkAssignments.filter((assignment) => !courseLessonIds.has(assignment.question_id));
    rebuildAfterDataChange(courseName === state.selectedCourseName ? null : state.selectedCourseName);
    render();
  } catch (error) {
    console.error(error);
    alert('Could not delete course.');
  }
}

function startCourseRename(courseName) {
  editingCourseName = courseName;
  courseNameDraft = courseName;
  renderCourseList();
  elements.courseList.querySelector('#courseRenameInput')?.focus();
}

function cancelCourseRename() {
  editingCourseName = null;
  courseNameDraft = '';
  savingCourseName = false;
  renderCourseList();
}

async function saveCourseRename() {
  const oldName = editingCourseName;
  const nextName = courseNameDraft.trim();
  if (!oldName) return;
  if (!nextName) {
    alert('Course name cannot be empty.');
    return;
  }
  if (nextName === oldName) {
    cancelCourseRename();
    return;
  }
  if (courseSummaries.some((summary) => summary.name === nextName)) {
    alert('A course with this name already exists.');
    return;
  }

  const confirmed = await confirmMarkdownUpdate({
    title: 'Rename course',
    text: `Rename "${oldName}" to "${nextName}" for all lessons in this course?`,
    actionLabel: 'Rename Course',
  });
  if (!confirmed) return;

  savingCourseName = true;
  renderCourseList();
  try {
    await updateInterviewQuestionsByCourse(oldName, { course_name: nextName });
    allQuestionRows = allQuestionRows.map((row) => (
      getRowCourseName(row) === oldName ? { ...row, course_name: nextName } : row
    ));
    editingCourseName = null;
    courseNameDraft = '';
    savingCourseName = false;
    rebuildAfterDataChange(nextName);
    render();
  } catch (error) {
    console.error(error);
    savingCourseName = false;
    alert('Could not rename course.');
    renderCourseList();
  }
}

function getNextOrderIndex(courseName) {
  const courseRows = buildCourseRows(courseName);
  if (!courseRows.length) return 1;
  return Math.max(...courseRows.map((row) => Number(row.order_index) || 0)) + 1;
}

function openLessonImportDialog() {
  lessonImportOpen = true;
  lessonImportMode = 'single';
  lessonImportError = '';
  lessonImportStatus = '';
  lessonImportProgress = { total: 0, completed: 0 };
  lessonImportDraft = {
    courseName: state.selectedCourseName || course.title || '',
    question: '',
    answer: '',
    module: 'Basic',
    category: '',
    tags: '',
    json: bulkLessonJsonSample,
  };
  renderLessonImportDialog();
  elements.lessonImportForm.querySelector('[name="courseName"]')?.focus();
}

function closeLessonImportDialog() {
  if (savingLessonImport) return;
  lessonImportOpen = false;
  lessonImportError = '';
  lessonImportStatus = '';
  renderLessonImportDialog();
}

function setLessonImportMode(mode) {
  lessonImportMode = mode;
  lessonImportError = '';
  lessonImportStatus = '';
  lessonImportProgress = { total: 0, completed: 0 };
  if (mode === 'bulk' && !lessonImportDraft.json.trim()) {
    lessonImportDraft.json = bulkLessonJsonSample;
  }
  renderLessonImportDialog();
}

function updateLessonImportDraft() {
  elements.lessonImportForm.querySelectorAll('[data-import-field]').forEach((field) => {
    lessonImportDraft[field.name] = field.value;
  });
}

function parseTags(value) {
  return value.split(',').map((tag) => tag.trim()).filter(Boolean);
}

function buildLessonEditDraft(lesson) {
  return {
    courseName: lesson.courseName || state.selectedCourseName || course.title || '',
    question: lesson.question || '',
    answer: lesson.answer || '',
    module: lesson.module || 'Basic',
    category: lesson.category || '',
    tags: Array.isArray(lesson.tags) ? lesson.tags.join(', ') : '',
  };
}

function updateLessonEditDraft() {
  elements.lessonQuestion.querySelectorAll('[data-lesson-edit-field]').forEach((field) => {
    lessonEditDraft[field.name] = field.value;
  });
}

function normalizeSingleLessonRow() {
  const courseName = lessonImportDraft.courseName.trim();
  const question = lessonImportDraft.question.trim();
  const answer = lessonImportDraft.answer.trim();
  const moduleName = lessonImportDraft.module.trim();
  const category = lessonImportDraft.category.trim();
  if (!courseName) throw new Error('Course name is required.');
  if (!moduleName) throw new Error('Module is required.');
  if (!question) throw new Error('Question markdown is required.');
  if (!answer) throw new Error('Answer markdown is required.');
  if (!category) throw new Error('Category is required.');
  return {
    course_name: courseName,
    order_index: getNextOrderIndex(courseName),
    question,
    answer,
    module: moduleName,
    category,
    tags: parseTags(lessonImportDraft.tags),
    mark_as_complete: false,
    bookmark: false,
    notes: [],
  };
}

function assertStrictBulkLesson(item, index) {
  const requiredKeys = ['question', 'type', 'category', 'tags', 'answer'];
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error(`Item ${index + 1} must be an object.`);
  }
  const keys = Object.keys(item).sort();
  const expected = [...requiredKeys].sort();
  if (keys.length !== expected.length || keys.some((key, keyIndex) => key !== expected[keyIndex])) {
    throw new Error(`Item ${index + 1} must contain exactly: question, type, category, tags, answer.`);
  }
  ['question', 'type', 'category', 'answer'].forEach((key) => {
    if (typeof item[key] !== 'string' || !item[key].trim()) {
      throw new Error(`Item ${index + 1}.${key} must be a non-empty string.`);
    }
  });
  if (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== 'string')) {
    throw new Error(`Item ${index + 1}.tags must be an array of strings.`);
  }
}

function normalizeBulkLessonRows() {
  const courseName = lessonImportDraft.courseName.trim();
  if (!courseName) throw new Error('Course name is required.');
  let parsed;
  try {
    parsed = JSON.parse(lessonImportDraft.json);
  } catch {
    throw new Error('Bulk JSON is not valid JSON.');
  }
  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error('Bulk JSON must be a non-empty array.');
  }
  const startOrder = getNextOrderIndex(courseName);
  return parsed.map((item, index) => {
    assertStrictBulkLesson(item, index);
    return {
      course_name: courseName,
      order_index: startOrder + index,
      question: item.question.trim(),
      answer: item.answer.trim(),
      module: item.type.trim(),
      category: item.category.trim(),
      tags: item.tags.map((tag) => tag.trim()).filter(Boolean),
      mark_as_complete: false,
      bookmark: false,
      notes: [],
    };
  });
}

async function importLessonRows(rows) {
  const courseName = rows[0]?.course_name;
  lessonImportProgress = { total: rows.length, completed: 0 };
  lessonImportStatus = `Uploading 0 / ${rows.length}`;
  renderLessonImportDialog();

  const insertedRows = [];
  const batchSize = 10;
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const inserted = await createInterviewQuestions(batch);
    insertedRows.push(...inserted);
    lessonImportProgress = {
      total: rows.length,
      completed: Math.min(start + batch.length, rows.length),
    };
    lessonImportStatus = `Uploading ${lessonImportProgress.completed} / ${rows.length}`;
    renderLessonImportDialog();
  }

  allQuestionRows = [...allQuestionRows, ...insertedRows];
  courseSummaries = getCourseSummaries(allQuestionRows);
  setActiveCourse(courseName, { keepSearch: true });
  lessonImportOpen = false;
  lessonImportStatus = `Imported ${rows.length} lesson${rows.length === 1 ? '' : 's'}.`;
  lessonImportError = '';
  savingLessonImport = false;
  render();
}

async function saveLessonImport() {
  updateLessonImportDraft();
  lessonImportError = '';
  lessonImportStatus = '';
  try {
    const rows = lessonImportMode === 'single'
      ? [normalizeSingleLessonRow()]
      : normalizeBulkLessonRows();
    savingLessonImport = true;
    await importLessonRows(rows);
  } catch (error) {
    console.error(error);
    savingLessonImport = false;
    lessonImportError = error.message;
    renderLessonImportDialog();
  }
}

async function patchLesson(lessonId, patch) {
  const updated = await updateInterviewQuestion(lessonId, patch);
  return updated;
}

function mergeUpdatedLessonRow(lessonId, patch, updated) {
  allQuestionRows = allQuestionRows.map((row) => {
    if (row.id !== lessonId) return row;
    return {
      ...row,
      ...patch,
      ...(updated || {}),
    };
  });
}

function setSelectedLesson(lessonId) {
  state.selectedLessonId = lessonId;
  bookmarkPickerOpen = false;
  addingBookmarkLabel = false;
  resetMarkdownEditors();
  persist();
  render();
}

function renderTopMeta() {
  const totalLessons = flattenLessons(course).length;
  const completedCount = getCompletedCount(course, state);
  const progressPercent = getProgressPercent(course, state);
  elements.moduleMetaLabel.textContent = `${totalLessons} lessons`;
  elements.topbarCourseName.textContent = course.title;
  elements.overallProgressPercent.textContent = `${progressPercent}%`;
  elements.overallProgressFill.style.width = `${progressPercent}%`;
  elements.overallProgressText.textContent = `${completedCount} / ${totalLessons} lessons completed`;
}

function glowTopProgress() {
  window.clearTimeout(progressGlowTimer);
  elements.overallProgressPercent.classList.add('is-glowing');
  elements.overallProgressText.classList.add('is-glowing');
  elements.overallProgressFill.classList.add('is-glowing');
  progressGlowTimer = window.setTimeout(() => {
    elements.overallProgressPercent.classList.remove('is-glowing');
    elements.overallProgressText.classList.remove('is-glowing');
    elements.overallProgressFill.classList.remove('is-glowing');
  }, 1200);
}

function sprinkleProgress() {
  const burst = document.createElement('span');
  burst.className = 'progress-sprinkle-burst';
  const particles = [
    ['-28px', '-18px', '#22c55e', '-18deg'],
    ['-14px', '-26px', '#00c9b1', '16deg'],
    ['2px', '-22px', '#f59e0b', '34deg'],
    ['18px', '-18px', '#3b82f6', '-28deg'],
    ['32px', '-10px', '#ef4444', '24deg'],
    ['-22px', '10px', '#facc15', '10deg'],
    ['10px', '12px', '#22c55e', '-36deg'],
    ['28px', '8px', '#00c9b1', '42deg'],
  ];
  burst.innerHTML = particles.map(([x, y, color, rotate]) => `
    <i style="--x: ${x}; --y: ${y}; --sprinkle-color: ${color}; --rotate: ${rotate};"></i>
  `).join('');
  elements.topbarProgress.append(burst);
  window.setTimeout(() => burst.remove(), 900);
}

function showCompletionToast(completedCount) {
  window.clearTimeout(completionToastTimer);
  const milestonePhrases = [
    'Milestone hit.',
    'Momentum unlocked.',
    'You are stacking wins.',
    'Five more locked in.',
    'Progress looks good.',
  ];
  const isMilestone = completedCount > 0 && completedCount % 5 === 0;
  const milestoneIndex = Math.floor(completedCount / 5 - 1) % milestonePhrases.length;
  const title = isMilestone ? milestonePhrases[milestoneIndex] : 'Nice.';
  const detail = isMilestone
    ? `${completedCount} lessons completed. Keep the streak alive.`
    : `${completedCount} lessons completed.`;
  const icon = isMilestone ? '&#127881;' : '&#128293;';
  elements.completionToast.innerHTML = `
    <span class="completion-toast-icon" aria-hidden="true">🔥</span>
    <strong>${title}</strong>
    <span>${detail}</span>
  `;
  elements.completionToast.querySelector('.completion-toast-icon').innerHTML = icon;
  elements.completionToast.classList.toggle('is-milestone', isMilestone);
  elements.completionToast.classList.remove('hidden');
  elements.completionToast.classList.remove('is-leaving');
  elements.completionToast.classList.remove('is-visible');
  void elements.completionToast.offsetWidth;
  elements.completionToast.classList.add('is-visible');
  completionToastTimer = window.setTimeout(() => {
    elements.completionToast.classList.add('is-leaving');
    elements.completionToast.classList.remove('is-visible');
    completionToastTimer = window.setTimeout(() => {
      elements.completionToast.classList.add('hidden');
      elements.completionToast.classList.remove('is-leaving');
    }, 220);
  }, 2600);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-999px';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function showAnswerToolFeedback(button, label) {
  if (!button) return;
  window.clearTimeout(answerCopiedTimer);
  const previousTitle = button.title;
  const previousLabel = button.getAttribute('aria-label');
  button.classList.add('has-feedback');
  button.title = label;
  button.setAttribute('aria-label', label);
  answerCopiedTimer = window.setTimeout(() => {
    button.classList.remove('has-feedback');
    button.title = previousTitle;
    button.setAttribute('aria-label', previousLabel);
  }, 1200);
}

function resolveAnswerConfirm(confirmed) {
  if (!answerConfirmResolver) return;
  const resolver = answerConfirmResolver;
  answerConfirmResolver = null;
  elements.answerConfirmOverlay.classList.add('hidden');
  document.removeEventListener('keydown', handleAnswerConfirmKeydown);
  resolver(confirmed);
}

elements.cancelAnswerConfirmButton.addEventListener('click', () => resolveAnswerConfirm(false));
elements.confirmAnswerUpdateButton.addEventListener('click', () => resolveAnswerConfirm(true));
elements.answerConfirmOverlay.addEventListener('click', (event) => {
  if (event.target === elements.answerConfirmOverlay) {
    resolveAnswerConfirm(false);
  }
});

function handleAnswerConfirmKeydown(event) {
  if (event.key === 'Escape') {
    resolveAnswerConfirm(false);
  }
}

function confirmMarkdownUpdate({ title, text, actionLabel = 'Confirm Changes' }) {
  elements.answerConfirmTitle.textContent = title;
  elements.answerConfirmText.textContent = text;
  elements.confirmAnswerUpdateButton.textContent = actionLabel;
  elements.answerConfirmOverlay.classList.remove('hidden');
  document.addEventListener('keydown', handleAnswerConfirmKeydown);
  elements.confirmAnswerUpdateButton.focus();

  return new Promise((resolve) => {
    answerConfirmResolver = resolve;
  });
}

function cancelLessonEdit() {
  editingLessonId = null;
  lessonEditDraft = null;
  savingLessonEdit = false;
  renderLessonCard();
}

async function saveLessonEdit(lesson) {
  updateLessonEditDraft();
  const nextCourseName = lessonEditDraft.courseName.trim();
  const nextQuestion = lessonEditDraft.question.trim();
  const nextAnswer = lessonEditDraft.answer.trim();
  const nextCategory = lessonEditDraft.category.trim();
  const nextModule = lessonEditDraft.module.trim();
  const nextTags = parseTags(lessonEditDraft.tags);

  if (!nextCourseName) {
    alert('Course name is required.');
    return;
  }
  if (!nextModule) {
    alert('Module is required.');
    return;
  }
  if (!nextQuestion) {
    alert('Question markdown is required.');
    return;
  }
  if (!nextAnswer) {
    alert('Answer markdown is required.');
    return;
  }
  if (!nextCategory) {
    alert('Category is required.');
    return;
  }

  const courseChanged = nextCourseName !== (lesson.courseName || state.selectedCourseName || course.title);
  const patch = {
    course_name: nextCourseName,
    question: nextQuestion,
    answer: nextAnswer,
    module: nextModule,
    category: nextCategory,
    tags: nextTags,
    ...(courseChanged ? { order_index: getNextOrderIndex(nextCourseName) } : {}),
  };
  const unchanged = !courseChanged
    && nextQuestion === (lesson.question || '')
    && nextAnswer === (lesson.answer || '')
    && nextModule === (lesson.module || 'Basic')
    && nextCategory === (lesson.category || '')
    && nextTags.join('\u0000') === (Array.isArray(lesson.tags) ? lesson.tags : []).join('\u0000');

  if (unchanged) {
    cancelLessonEdit();
    return;
  }

  const confirmed = await confirmMarkdownUpdate({
    title: 'Update lesson',
    text: 'Save these changes to this lesson?',
    actionLabel: 'Update Lesson',
  });
  if (!confirmed) return;

  savingLessonEdit = true;
  renderLessonCard();
  try {
    const updated = await patchLesson(lesson.id, patch);
    mergeUpdatedLessonRow(lesson.id, patch, updated);
    editingLessonId = null;
    lessonEditDraft = null;
    savingLessonEdit = false;
    courseSummaries = getCourseSummaries(allQuestionRows);
    setActiveCourse(nextCourseName, { keepSearch: true, keepSelectedLesson: true });
    render();
  } catch (error) {
    console.error(error);
    savingLessonEdit = false;
    alert('Could not save lesson changes.');
    renderLessonCard();
  }
}

function cancelAnswerEdit() {
  editingAnswerId = null;
  answerDraft = '';
  savingAnswer = false;
  renderLessonCard();
}

async function saveAnswerEdit(lesson) {
  const textarea = elements.lessonAnswer.querySelector('#answerEditorTextarea');
  const nextAnswer = textarea?.value ?? answerDraft;
  answerDraft = nextAnswer;

  if (!nextAnswer.trim()) {
    alert('Answer cannot be empty.');
    return;
  }

  if (nextAnswer === lesson.answer) {
    cancelAnswerEdit();
    return;
  }

  const confirmed = await confirmMarkdownUpdate({
    title: 'Confirm answer update',
    text: 'Save these markdown changes to this answer?',
  });
  if (!confirmed) return;

  savingAnswer = true;
  renderLessonCard();
  try {
    const patch = { answer: nextAnswer };
    const updated = await patchLesson(lesson.id, patch);
    mergeUpdatedLessonRow(lesson.id, patch, updated);
    lesson.answer = nextAnswer;
    editingAnswerId = null;
    answerDraft = '';
    savingAnswer = false;
    renderLessonCard();
  } catch (error) {
    console.error(error);
    savingAnswer = false;
    alert('Could not save answer changes.');
    renderLessonCard();
  }
}

function renderSidebarNav() {
  elements.navMyLearning.classList.toggle('is-active', state.sidebarMode === 'my-learning');
  elements.myLearningContent.classList.toggle('hidden', !state.myLearningExpanded);
  elements.myLearningChevron.classList.toggle('is-open', state.myLearningExpanded);
  renderCourseList();

  elements.learningSidebar.classList.toggle('is-collapsed', state.leftPanelCollapsed);
  elements.sidePanel.classList.toggle('is-collapsed', state.rightPanelCollapsed);
  elements.app.classList.toggle('left-collapsed', state.leftPanelCollapsed);
  elements.app.classList.toggle('right-collapsed', state.rightPanelCollapsed);
  elements.toggleLeftPanelButton.setAttribute('aria-label', state.leftPanelCollapsed ? 'Expand lesson list' : 'Collapse lesson list');
  elements.toggleLeftPanelButton.title = state.leftPanelCollapsed ? 'Expand lesson list' : 'Collapse lesson list';
  elements.toggleLeftPanelButton.innerHTML = state.leftPanelCollapsed
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" d="M5 7h14M5 12h14M5 17h14" /></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" /></svg>';
  elements.toggleRightPanelButton.setAttribute('aria-label', state.rightPanelCollapsed ? 'Expand notes panel' : 'Collapse notes panel');
  elements.toggleRightPanelButton.title = state.rightPanelCollapsed ? 'Expand notes panel' : 'Collapse notes panel';
  elements.toggleRightPanelButton.innerHTML = state.rightPanelCollapsed
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" /></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" /></svg>';
}

function renderCourseList() {
  if (!courseSummaries.length) {
    elements.courseList.innerHTML = '<p class="course-list-empty">No courses yet</p>';
    return;
  }

  elements.courseList.innerHTML = courseSummaries.map((summary) => {
    const isEditing = editingCourseName === summary.name;
    return `
      <div class="course-nav-row ${summary.name === state.selectedCourseName ? 'is-active' : ''} ${isEditing ? 'is-editing' : ''}">
        ${isEditing ? `
          <div class="course-rename-editor">
            <input id="courseRenameInput" type="text" value="${escapeHtml(courseNameDraft)}" ${savingCourseName ? 'disabled' : ''} />
            <button class="course-mini-button" data-save-course-name="${escapeHtml(summary.name)}" type="button" title="Save course name" aria-label="Save course name" ${savingCourseName ? 'disabled' : ''}>&#10003;</button>
            <button class="course-mini-button" data-cancel-course-name="${escapeHtml(summary.name)}" type="button" title="Cancel rename" aria-label="Cancel rename" ${savingCourseName ? 'disabled' : ''}>&times;</button>
          </div>
        ` : `
          <button class="course-nav-item" data-course-name="${escapeHtml(summary.name)}" type="button">
            <span>${escapeHtml(summary.name)}</span>
            <span>${summary.totalLessons} lessons</span>
          </button>
          <button class="course-action-button" data-edit-course-name="${escapeHtml(summary.name)}" type="button" aria-label="Rename ${escapeHtml(summary.name)} course" title="Rename course">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.75 19.25h4.1L18.6 9.5a2.12 2.12 0 0 0-3-3L5.85 16.25l-1.1 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.6 7.5 1.9 1.9" />
            </svg>
          </button>
          <button class="course-action-button is-danger" data-delete-course-name="${escapeHtml(summary.name)}" type="button" aria-label="Delete ${escapeHtml(summary.name)} course" title="Delete course">&times;</button>
        `}
      </div>
    `;
  }).join('');

  elements.courseList.querySelectorAll('[data-course-name]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextCourseName = button.dataset.courseName;
      if (nextCourseName === state.selectedCourseName) {
        const firstLesson = flattenLessons(course)[0];
        if (firstLesson) setSelectedLesson(firstLesson.id);
        return;
      }
      setActiveCourse(nextCourseName);
      render();
    });
  });

  elements.courseList.querySelectorAll('[data-delete-course-name]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteCourseByName(button.dataset.deleteCourseName);
    });
  });

  elements.courseList.querySelectorAll('[data-edit-course-name]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      startCourseRename(button.dataset.editCourseName);
    });
  });

  elements.courseList.querySelector('#courseRenameInput')?.addEventListener('input', (event) => {
    courseNameDraft = event.target.value;
  });
  elements.courseList.querySelector('#courseRenameInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveCourseRename();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelCourseRename();
    }
  });
  elements.courseList.querySelector('[data-save-course-name]')?.addEventListener('click', saveCourseRename);
  elements.courseList.querySelector('[data-cancel-course-name]')?.addEventListener('click', cancelCourseRename);
}

function renderLessonImportDialog() {
  elements.lessonImportOverlay.classList.toggle('hidden', !lessonImportOpen);
  elements.singleLessonModeButton.classList.toggle('is-active', lessonImportMode === 'single');
  elements.bulkLessonModeButton.classList.toggle('is-active', lessonImportMode === 'bulk');
  if (!lessonImportOpen) {
    elements.lessonImportForm.innerHTML = '';
    return;
  }

  const progressPercent = lessonImportProgress.total
    ? Math.round((lessonImportProgress.completed / lessonImportProgress.total) * 100)
    : 0;
  const courseValue = escapeHtml(lessonImportDraft.courseName || state.selectedCourseName || course.title || '');
  const progressMarkup = savingLessonImport || lessonImportStatus ? `
    <div class="lesson-import-progress">
      <div class="lesson-import-progress-meta">
        <span>${escapeHtml(lessonImportStatus || 'Preparing import...')}</span>
        <span>${progressPercent}%</span>
      </div>
      <div class="lesson-import-progress-track">
        <span style="width: ${progressPercent}%"></span>
      </div>
    </div>
  ` : '';

  const sharedCourseField = `
    <label class="lesson-import-field">
      <span>Course name</span>
      <input data-import-field name="courseName" type="text" value="${courseValue}" placeholder="Course name" ${savingLessonImport ? 'disabled' : ''} />
    </label>
  `;

  elements.lessonImportForm.innerHTML = lessonImportMode === 'single' ? `
    ${sharedCourseField}
    <div class="lesson-import-grid">
      <label class="lesson-import-field">
        <span>Module</span>
        <input data-import-field name="module" type="text" value="${escapeHtml(lessonImportDraft.module)}" placeholder="Module name" ${savingLessonImport ? 'disabled' : ''} />
      </label>
      <label class="lesson-import-field">
        <span>Category</span>
        <input data-import-field name="category" type="text" value="${escapeHtml(lessonImportDraft.category)}" placeholder="Python & Coding" ${savingLessonImport ? 'disabled' : ''} />
      </label>
    </div>
    <label class="lesson-import-field">
      <span>Tags</span>
      <input data-import-field name="tags" type="text" value="${escapeHtml(lessonImportDraft.tags)}" placeholder="Python, strings, APIs" ${savingLessonImport ? 'disabled' : ''} />
    </label>
    <label class="lesson-import-field">
      <span>Question markdown</span>
      <textarea data-import-field name="question" placeholder="Question in markdown..." ${savingLessonImport ? 'disabled' : ''}>${escapeHtml(lessonImportDraft.question)}</textarea>
    </label>
    <label class="lesson-import-field">
      <span>Answer markdown</span>
      <textarea data-import-field name="answer" class="is-large" placeholder="Answer in markdown..." ${savingLessonImport ? 'disabled' : ''}>${escapeHtml(lessonImportDraft.answer)}</textarea>
    </label>
    ${lessonImportError ? `<p class="lesson-import-error">${escapeHtml(lessonImportError)}</p>` : ''}
    ${progressMarkup}
    <div class="lesson-import-actions">
      <button id="cancelLessonImportButton" class="confirm-button secondary" type="button" ${savingLessonImport ? 'disabled' : ''}>Cancel</button>
      <button id="saveLessonImportButton" class="confirm-button primary" type="button" ${savingLessonImport ? 'disabled' : ''}>${savingLessonImport ? 'Uploading...' : 'Add Lesson'}</button>
    </div>
  ` : `
    ${sharedCourseField}
    <div class="lesson-import-hint">
      Strict JSON schema: each item must contain exactly <code>question</code>, <code>type</code>, <code>category</code>, <code>tags</code>, and <code>answer</code>.
    </div>
    <label class="lesson-import-field">
      <span>Bulk JSON</span>
      <textarea data-import-field name="json" class="is-json" placeholder='[{"question":"...","type":"Basic","category":"...","tags":["Python"],"answer":"..."}]' ${savingLessonImport ? 'disabled' : ''}>${escapeHtml(lessonImportDraft.json)}</textarea>
    </label>
    ${lessonImportError ? `<p class="lesson-import-error">${escapeHtml(lessonImportError)}</p>` : ''}
    ${progressMarkup}
    <div class="lesson-import-actions">
      <button id="cancelLessonImportButton" class="confirm-button secondary" type="button" ${savingLessonImport ? 'disabled' : ''}>Cancel</button>
      <button id="saveLessonImportButton" class="confirm-button primary" type="button" ${savingLessonImport ? 'disabled' : ''}>${savingLessonImport ? 'Uploading...' : 'Import JSON'}</button>
    </div>
  `;

  elements.lessonImportForm.querySelectorAll('[data-import-field]').forEach((field) => {
    field.addEventListener('input', updateLessonImportDraft);
    field.addEventListener('change', updateLessonImportDraft);
  });
  elements.lessonImportForm.querySelector('#cancelLessonImportButton')?.addEventListener('click', closeLessonImportDialog);
  elements.lessonImportForm.querySelector('#saveLessonImportButton')?.addEventListener('click', saveLessonImport);
}

function renderModuleList() {
  const visibleModules = getVisibleModules(course, state);
  elements.moduleAccordionList.innerHTML = '';

  visibleModules.forEach((module) => {
    const completion = getModuleCompletion(module, state);
    const section = document.createElement('section');
    section.className = 'module-card';

    const expanded = state.expandedModuleIds.includes(module.id);
    const header = document.createElement('button');
    header.type = 'button';
    header.className = `module-header ${completion.completed === completion.total && completion.total > 0 ? 'is-complete' : ''}`;
    header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    header.setAttribute('aria-controls', `${module.id}-content`);
    header.innerHTML = `
      <div class="module-header-left">
        <div class="module-icon-shell">
          ${completion.completed === completion.total && completion.total > 0
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" /></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5V6.75A1.75 1.75 0 0 1 5.75 5h4.9c1.09 0 2.13.43 2.9 1.2l.45.45.45-.45A4.1 4.1 0 0 1 17.35 5h.9A1.75 1.75 0 0 1 20 6.75V19.5l-5.2-1.73a8.8 8.8 0 0 0-5.6 0L4 19.5Z" /></svg>'}
        </div>
        <div>
          <div class="module-title">${escapeHtml(module.title)}</div>
          <div class="module-subtitle">${escapeHtml(module.subtitle)}</div>
        </div>
      </div>
      <div class="module-header-right">
        <span class="module-completion">${completion.completed}/${completion.total}</span>
        <svg class="module-chevron ${expanded ? 'is-open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m7 10 5 5 5-5" />
        </svg>
      </div>
    `;

    header.addEventListener('click', () => {
      if (expanded) {
        state.expandedModuleIds = state.expandedModuleIds.filter((id) => id !== module.id);
      } else {
        state.expandedModuleIds = [...state.expandedModuleIds, module.id];
      }
      persist();
      renderModuleList();
    });

    section.append(header);

    if (expanded) {
      const content = document.createElement('div');
      content.id = `${module.id}-content`;
      content.className = 'module-content';

      module.categories.forEach((category) => {
        const group = document.createElement('div');
        group.className = 'module-category';
        group.innerHTML = `<div class="module-category-title">${escapeHtml(category.title)}</div>`;

        category.lessons.forEach((lesson) => {
          const lessonState = state.lessonState[lesson.id];
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `lesson-row ${state.selectedLessonId === lesson.id ? 'is-current' : ''}`;
          button.innerHTML = `
            <span class="lesson-row-status ${lessonState.completed ? 'is-complete' : state.selectedLessonId === lesson.id ? 'is-current' : ''}">
              ${lessonState.completed ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/></svg>' : ''}
            </span>
            <span class="lesson-row-number">${lesson.displayNumber || lesson.number}.</span>
            <span class="lesson-row-title">${escapeHtml(lesson.title)}</span>
          `;
          button.addEventListener('click', () => setSelectedLesson(lesson.id));
          group.append(button);
        });

        content.append(group);
      });

      section.append(content);
    }

    elements.moduleAccordionList.append(section);
  });
}

function renderBreadcrumb(lesson) {
  const module = course.modules.find((item) => item.id === lesson.moduleId);
  const crumbs = [
    'My Learning',
    module ? module.title : '',
    `${lesson.displayNumber || lesson.number}. ${lesson.title}`,
  ].filter(Boolean);

  elements.breadcrumbRow.innerHTML = crumbs
    .map((item, index) => `<span class="breadcrumb-item ${index === crumbs.length - 1 ? 'is-current' : ''}">${escapeHtml(item)}</span>`)
    .join('<span class="breadcrumb-separator">›</span>');
}

function getBookmarkLabel(labelId) {
  return bookmarkLabels.find((label) => label.id === labelId) || null;
}

function getBookmarkLabelIds(lessonState) {
  if (Array.isArray(lessonState.bookmarkLabelIds)) return lessonState.bookmarkLabelIds.filter(Boolean);
  return lessonState.bookmarkLabelId ? [lessonState.bookmarkLabelId] : [];
}

function getBookmarkLabels(lessonState) {
  const labelIds = getBookmarkLabelIds(lessonState);
  return labelIds.map((labelId) => getBookmarkLabel(labelId)).filter(Boolean);
}

function renderLabelBadge(label) {
  if (!label) return '';
  return `
    <span class="bookmark-label-badge" style="--label-color: ${escapeHtml(label.color || '#00c9b1')}" title="${escapeHtml(label.name)}">
      <span>${escapeHtml(label.name)}</span>
    </span>
  `;
}

function renderLabelBadges(labels) {
  if (!labels.length) return '';
  return `<span class="bookmark-label-badge-stack">${labels.map((label) => renderLabelBadge(label)).join('')}</span>`;
}

function renderSelectedBookmarkLabel(lesson, lessonState) {
  const labels = getBookmarkLabels(lessonState);
  elements.selectedBookmarkLabel.classList.toggle('hidden', !labels.length);
  if (!labels.length) {
    elements.selectedBookmarkLabel.innerHTML = '';
    return;
  }

  elements.selectedBookmarkLabel.innerHTML = labels.map((label) => `
    <span class="selected-bookmark-chip" style="--label-color: ${escapeHtml(label.color || '#00c9b1')}">
      <span>${escapeHtml(label.name)}</span>
      <button data-remove-label-id="${escapeHtml(label.id)}" type="button" aria-label="Remove ${escapeHtml(label.name)} label">&times;</button>
    </span>
  `).join('');

  elements.selectedBookmarkLabel.querySelectorAll('[data-remove-label-id]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    removeBookmarkLabel(lesson, button.dataset.removeLabelId);
  }));
}

async function addBookmarkLabel(lesson, labelId) {
  const previous = state.lessonState[lesson.id];
  const selectedLabel = getBookmarkLabel(labelId);
  const nextLabelIds = [...new Set([...getBookmarkLabelIds(previous), labelId])];
  state.lessonState[lesson.id] = {
    ...previous,
    bookmarked: true,
    bookmarkLabelId: nextLabelIds[0] || null,
    bookmarkLabelIds: nextLabelIds,
  };
  addingBookmarkLabel = false;
  persist();
  render();
  try {
    await patchLesson(lesson.id, { bookmark: true });
  } catch (error) {
    console.warn('Label was added, but bookmark flag did not persist yet.', error);
  }

  if (!selectedLabel?.isLocal) {
    try {
      await addBookmarkLabelAssignment(lesson.id, labelId);
    } catch (error) {
      console.warn('Label was added locally, but assignment did not persist yet.', error);
    }
  }
}

async function removeBookmarkLabel(lesson, labelId) {
  const previous = state.lessonState[lesson.id];
  const nextLabelIds = getBookmarkLabelIds(previous).filter((item) => item !== labelId);
  state.lessonState[lesson.id] = {
    ...previous,
    bookmarked: nextLabelIds.length > 0,
    bookmarkLabelId: nextLabelIds[0] || null,
    bookmarkLabelIds: nextLabelIds,
  };
  addingBookmarkLabel = false;
  persist();
  render();
  try {
    await patchLesson(lesson.id, { bookmark: nextLabelIds.length > 0 });
  } catch (error) {
    console.warn('Label was removed, but bookmark flag did not persist yet.', error);
  }

  try {
    await removeBookmarkLabelAssignment(lesson.id, labelId);
  } catch (error) {
    console.warn('Label was removed locally, but assignment removal did not persist yet.', error);
  }
}

async function toggleBookmarkLabel(lesson, labelId) {
  const selectedLabelIds = getBookmarkLabelIds(state.lessonState[lesson.id]);
  if (selectedLabelIds.includes(labelId)) {
    await removeBookmarkLabel(lesson, labelId);
  } else {
    await addBookmarkLabel(lesson, labelId);
  }
}

function removeLabelFromLocalState(labelId) {
  bookmarkLabels = bookmarkLabels.filter((label) => label.id !== labelId);
  Object.keys(state.lessonState).forEach((lessonId) => {
    const lessonState = state.lessonState[lessonId];
    const nextLabelIds = getBookmarkLabelIds(lessonState).filter((item) => item !== labelId);
    state.lessonState[lessonId] = {
      ...lessonState,
      bookmarked: nextLabelIds.length > 0,
      bookmarkLabelId: nextLabelIds[0] || null,
      bookmarkLabelIds: nextLabelIds,
    };
  });
  if (state.bookmarkLabelFilterId === labelId) {
    state.bookmarkLabelFilterId = 'all';
  }
  persist();
}

async function deleteGlobalBookmarkLabel(labelId) {
  const label = getBookmarkLabel(labelId);
  if (!label) return;

  const confirmed = await confirmMarkdownUpdate({
    title: 'Delete bookmark label',
    text: `Remove "${label.name}" from the label list and all bookmarked lessons?`,
    actionLabel: 'Delete Label',
  });
  if (!confirmed) return;

  try {
    await removeBookmarkLabelAssignmentsByLabel(labelId);
    await deleteBookmarkLabel(labelId);
    removeLabelFromLocalState(labelId);
    addingBookmarkLabel = false;
    bookmarkLabelDraftName = '';
    bookmarkLabelError = '';
    render();
  } catch (error) {
    console.error(error);
    bookmarkLabelError = 'Could not delete label. Check table delete permissions.';
    renderBookmarkLabelPicker(getLessonById(course, state.selectedLessonId), state.lessonState[state.selectedLessonId]);
  }
}

async function clearBookmark(lesson) {
  const previous = state.lessonState[lesson.id];
  const previousLabelIds = getBookmarkLabelIds(previous);
  state.lessonState[lesson.id] = {
    ...previous,
    bookmarked: false,
    bookmarkLabelId: null,
    bookmarkLabelIds: [],
  };
  bookmarkPickerOpen = false;
  addingBookmarkLabel = false;
  persist();
  render();
  try {
    await patchLesson(lesson.id, { bookmark: false });
  } catch (error) {
    console.warn('Bookmark was cleared, but bookmark flag did not persist yet.', error);
  }

  try {
    await Promise.all(previousLabelIds.map((labelId) => removeBookmarkLabelAssignment(lesson.id, labelId)));
  } catch (error) {
    console.warn('Bookmark was cleared locally, but label assignments did not fully persist yet.', error);
  }
}

function renderBookmarkLabelPicker(lesson, lessonState) {
  elements.bookmarkLabelPicker.classList.toggle('hidden', !bookmarkPickerOpen);
  if (!bookmarkPickerOpen) {
    elements.bookmarkLabelPicker.innerHTML = '';
    return;
  }

  const selectedLabelIds = getBookmarkLabelIds(lessonState);
  const labelRows = bookmarkLabels.length
    ? bookmarkLabels.map((label) => `
        <div class="bookmark-label-option-row ${selectedLabelIds.includes(label.id) ? 'is-selected' : ''}">
          <button class="bookmark-label-option" data-label-id="${escapeHtml(label.id)}" type="button">
            <span class="label-dot" style="background: ${escapeHtml(label.color || '#00c9b1')}"></span>
            <span>${escapeHtml(label.name)}</span>
            <span class="label-check">${selectedLabelIds.includes(label.id) ? 'On' : ''}</span>
          </button>
          <button class="bookmark-label-delete" data-delete-label-id="${escapeHtml(label.id)}" type="button" aria-label="Delete ${escapeHtml(label.name)} label" title="Delete label">&times;</button>
        </div>
      `).join('')
    : '<p class="bookmark-label-empty">No labels yet.</p>';

  const addLabelView = addingBookmarkLabel ? `
    <div class="bookmark-label-form">
      <input id="newBookmarkLabelName" type="text" placeholder="Label name" maxlength="40" value="${escapeHtml(bookmarkLabelDraftName)}" />
      <div class="label-color-row">
        ${labelColors.map((color) => `
          <button class="label-color-button ${color === selectedLabelColor ? 'is-selected' : ''}" data-label-color="${color}" type="button" aria-label="Use ${color}" style="background: ${color}"></button>
        `).join('')}
      </div>
      ${bookmarkLabelError ? `<p class="bookmark-label-error">${escapeHtml(bookmarkLabelError)}</p>` : ''}
      <div class="bookmark-label-form-actions">
        <button id="cancelBookmarkLabelButton" class="secondary-button compact-label-button" type="button">Cancel</button>
        <button id="saveBookmarkLabelButton" class="complete-button compact-label-button" type="button" ${savingBookmarkLabel ? 'disabled' : ''}>
          <span>${savingBookmarkLabel ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  ` : '';

  elements.bookmarkLabelPicker.innerHTML = `
    <div class="bookmark-label-picker-head">
      <span>Bookmark labels</span>
      ${lessonState.bookmarked ? '<button id="removeBookmarkButton" type="button">Remove</button>' : ''}
    </div>
    <button id="showAddBookmarkLabelButton" class="bookmark-label-add" type="button">+ Add label</button>
    ${addLabelView}
    <div class="bookmark-label-options">${labelRows}</div>
  `;

  elements.bookmarkLabelPicker.onclick = (event) => event.stopPropagation();
  elements.bookmarkLabelPicker.querySelector('#removeBookmarkButton')?.addEventListener('click', () => clearBookmark(lesson));
  elements.bookmarkLabelPicker.querySelector('#showAddBookmarkLabelButton')?.addEventListener('click', (event) => {
    event.stopPropagation();
    addingBookmarkLabel = true;
    bookmarkLabelDraftName = '';
    bookmarkLabelError = '';
    renderBookmarkLabelPicker(lesson, lessonState);
    elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName')?.focus();
  });

  elements.bookmarkLabelPicker.querySelectorAll('[data-label-id]').forEach((button) => {
    button.addEventListener('click', () => toggleBookmarkLabel(lesson, button.dataset.labelId));
  });

  elements.bookmarkLabelPicker.querySelectorAll('[data-delete-label-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteGlobalBookmarkLabel(button.dataset.deleteLabelId);
    });
  });

  elements.bookmarkLabelPicker.querySelectorAll('[data-label-color]').forEach((button) => {
    button.addEventListener('click', () => {
      bookmarkLabelDraftName = elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName')?.value || '';
      bookmarkLabelError = '';
      selectedLabelColor = button.dataset.labelColor;
      renderBookmarkLabelPicker(lesson, lessonState);
      elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName')?.focus();
    });
  });

  elements.bookmarkLabelPicker.querySelector('#cancelBookmarkLabelButton')?.addEventListener('click', () => {
    addingBookmarkLabel = false;
    bookmarkLabelDraftName = '';
    bookmarkLabelError = '';
    renderBookmarkLabelPicker(lesson, lessonState);
  });

  const nameInput = elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName');
  nameInput?.addEventListener('input', (event) => {
    bookmarkLabelDraftName = event.target.value;
    bookmarkLabelError = '';
  });
  nameInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    elements.bookmarkLabelPicker.querySelector('#saveBookmarkLabelButton')?.click();
  });

  elements.bookmarkLabelPicker.querySelector('#saveBookmarkLabelButton')?.addEventListener('click', async () => {
    const input = elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName');
    const name = input?.value.trim();
    bookmarkLabelDraftName = input?.value || '';
    if (!name) {
      bookmarkLabelError = 'Enter a label name.';
      renderBookmarkLabelPicker(lesson, lessonState);
      elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName')?.focus();
      return;
    }
    try {
      savingBookmarkLabel = true;
      bookmarkLabelError = '';
      renderBookmarkLabelPicker(lesson, lessonState);
      const sortOrder = bookmarkLabels.length
        ? Math.max(...bookmarkLabels.map((label) => Number(label.sort_order) || 0)) + 1
        : 1;
      let created;
      const existingLabel = bookmarkLabels.find((label) => label.name.toLowerCase() === name.toLowerCase());
      if (existingLabel) {
        created = existingLabel;
      } else {
        try {
          created = await createBookmarkLabel({
            name,
            color: selectedLabelColor,
            sort_order: sortOrder,
          });
        } catch (error) {
          created = await fetchBookmarkLabelByName(name);
          if (!created) throw error;
        }
      }
      if (!created) {
        throw new Error('Label could not be created.');
      }
      bookmarkLabels = [...bookmarkLabels, created].sort((left, right) => {
        const orderDiff = (Number(left.sort_order) || 0) - (Number(right.sort_order) || 0);
        return orderDiff || String(left.name).localeCompare(String(right.name));
      });
      bookmarkLabels = [...new Map(bookmarkLabels.map((label) => [label.id, label])).values()];
      bookmarkLabelDraftName = '';
      savingBookmarkLabel = false;
      addingBookmarkLabel = false;
      renderBookmarkLabelPicker(lesson, state.lessonState[lesson.id]);
    } catch (error) {
      console.error(error);
      savingBookmarkLabel = false;
      bookmarkLabelError = 'Could not save label. Check the labels table.';
      addingBookmarkLabel = true;
      renderBookmarkLabelPicker(lesson, state.lessonState[lesson.id]);
      elements.bookmarkLabelPicker.querySelector('#newBookmarkLabelName')?.focus();
    }
  });
}

function renderLessonCard() {
  const lesson = getLessonById(course, state.selectedLessonId);
  if (!lesson) {
    elements.lessonCard.classList.add('hidden');
    elements.lessonCard.classList.remove('is-editing-lesson');
    elements.lessonEmptyState.classList.remove('hidden');
    elements.breadcrumbRow.innerHTML = '';
    elements.selectedBookmarkLabel.innerHTML = '';
    elements.selectedBookmarkLabel.classList.add('hidden');
    return;
  }

  const lessonState = state.lessonState[lesson.id];
  elements.lessonEmptyState.classList.add('hidden');
  elements.lessonCard.classList.remove('hidden');
  elements.lessonCard.classList.remove('is-advancing', 'is-entering');
  renderBreadcrumb(lesson);

  const isEditingLesson = editingLessonId === lesson.id;
  elements.lessonCard.classList.toggle('is-editing-lesson', isEditingLesson);
  elements.editQuestionButton.disabled = savingLessonEdit;
  elements.editQuestionButton.classList.toggle('is-active', isEditingLesson);
  elements.editQuestionButton.title = isEditingLesson ? 'Editing lesson' : 'Edit lesson';
  elements.editQuestionButton.setAttribute(
    'aria-label',
    isEditingLesson ? 'Editing lesson' : 'Edit lesson',
  );
  elements.editQuestionButton.onclick = () => {
    if (savingLessonEdit) return;
    editingAnswerId = null;
    answerDraft = '';
    editingLessonId = lesson.id;
    lessonEditDraft = buildLessonEditDraft(lesson);
    renderLessonCard();
    elements.lessonQuestion.querySelector('[name="courseName"]')?.focus();
  };
  elements.deleteLessonButton.disabled = savingLessonEdit || savingAnswer;
  elements.deleteLessonButton.onclick = () => {
    if (savingLessonEdit || savingAnswer) return;
    deleteCurrentLesson(lesson);
  };

  if (isEditingLesson) {
    const draft = lessonEditDraft || buildLessonEditDraft(lesson);
    elements.lessonQuestion.innerHTML = `
      <div class="lesson-full-editor">
        <div class="lesson-import-grid">
          <label class="lesson-import-field">
            <span>Course name</span>
            <input data-lesson-edit-field name="courseName" type="text" value="${escapeHtml(draft.courseName)}" ${savingLessonEdit ? 'disabled' : ''} />
          </label>
          <label class="lesson-import-field">
            <span>Module</span>
            <input data-lesson-edit-field name="module" type="text" value="${escapeHtml(draft.module)}" placeholder="Module name" ${savingLessonEdit ? 'disabled' : ''} />
          </label>
        </div>
        <label class="lesson-import-field">
          <span>Category</span>
          <input data-lesson-edit-field name="category" type="text" value="${escapeHtml(draft.category)}" ${savingLessonEdit ? 'disabled' : ''} />
        </label>
        <label class="lesson-import-field">
          <span>Tags</span>
          <input data-lesson-edit-field name="tags" type="text" value="${escapeHtml(draft.tags)}" placeholder="Python, APIs, RAG" ${savingLessonEdit ? 'disabled' : ''} />
        </label>
        <label class="lesson-import-field">
          <span>Question markdown</span>
          <textarea data-lesson-edit-field name="question" spellcheck="false" ${savingLessonEdit ? 'disabled' : ''}>${escapeHtml(draft.question)}</textarea>
        </label>
        <label class="lesson-import-field">
          <span>Answer markdown</span>
          <textarea data-lesson-edit-field name="answer" class="is-large" spellcheck="false" ${savingLessonEdit ? 'disabled' : ''}>${escapeHtml(draft.answer)}</textarea>
        </label>
        <div class="answer-editor-actions">
          <button id="cancelLessonEditButton" class="answer-editor-button secondary" type="button" title="Cancel changes" aria-label="Cancel changes" ${savingLessonEdit ? 'disabled' : ''}>&times;</button>
          <button id="saveLessonEditButton" class="answer-editor-button primary" type="button" title="Confirm changes" aria-label="Confirm changes" ${savingLessonEdit ? 'disabled' : ''}>${savingLessonEdit ? '...' : '&#10003;'}</button>
        </div>
      </div>
    `;
    elements.lessonQuestion.querySelectorAll('[data-lesson-edit-field]').forEach((field) => {
      field.addEventListener('input', updateLessonEditDraft);
      field.addEventListener('change', updateLessonEditDraft);
    });
    elements.lessonQuestion.querySelector('#cancelLessonEditButton')?.addEventListener('click', cancelLessonEdit);
    elements.lessonQuestion.querySelector('#saveLessonEditButton')?.addEventListener('click', () => saveLessonEdit(lesson));
  } else {
    elements.lessonQuestion.innerHTML = renderMarkdownToHtml(lesson.question);
  }

  const tags = Array.isArray(lesson.tags) ? lesson.tags.filter(Boolean) : [];
  elements.lessonTags.classList.toggle('hidden', isEditingLesson || !tags.length);
  elements.lessonTags.innerHTML = tags
    .slice(0, 6)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');
  const isEditingAnswer = editingAnswerId === lesson.id;
  elements.copyAnswerButton.disabled = isEditingLesson || isEditingAnswer || savingAnswer;
  elements.editAnswerButton.disabled = isEditingLesson || savingAnswer;
  elements.editAnswerButton.classList.toggle('is-active', isEditingAnswer);
  elements.editAnswerButton.title = isEditingAnswer ? 'Editing raw markdown' : 'Edit raw markdown';
  elements.editAnswerButton.setAttribute(
    'aria-label',
    isEditingAnswer ? 'Editing answer markdown' : 'Edit answer markdown',
  );

  elements.copyAnswerButton.onclick = async () => {
    try {
      await copyTextToClipboard(lesson.answer || '');
      showAnswerToolFeedback(elements.copyAnswerButton, 'Copied raw markdown');
    } catch (error) {
      console.error(error);
      alert('Could not copy answer markdown.');
    }
  };

  elements.editAnswerButton.onclick = () => {
    if (savingAnswer) return;
    editingLessonId = null;
    lessonEditDraft = null;
    editingAnswerId = lesson.id;
    answerDraft = lesson.answer || '';
    renderLessonCard();
    elements.lessonAnswer.querySelector('#answerEditorTextarea')?.focus();
  };

  if (isEditingLesson) {
    elements.lessonAnswer.innerHTML = '<p class="lesson-edit-muted">Answer markdown is included in the lesson editor above.</p>';
  } else if (isEditingAnswer) {
    elements.lessonAnswer.innerHTML = `
      <div class="answer-editor">
        <textarea id="answerEditorTextarea" spellcheck="false">${escapeHtml(answerDraft)}</textarea>
        <div class="answer-editor-actions">
          <button id="cancelAnswerEditButton" class="answer-editor-button secondary" type="button" title="Cancel changes" aria-label="Cancel changes" ${savingAnswer ? 'disabled' : ''}>&times;</button>
          <button id="saveAnswerEditButton" class="answer-editor-button primary" type="button" title="Confirm changes" aria-label="Confirm changes" ${savingAnswer ? 'disabled' : ''}>${savingAnswer ? '...' : '&#10003;'}</button>
        </div>
      </div>
    `;
    const answerTextarea = elements.lessonAnswer.querySelector('#answerEditorTextarea');
    answerTextarea?.addEventListener('input', (event) => {
      answerDraft = event.target.value;
    });
    elements.lessonAnswer.querySelector('#cancelAnswerEditButton')?.addEventListener('click', cancelAnswerEdit);
    elements.lessonAnswer.querySelector('#saveAnswerEditButton')?.addEventListener('click', () => saveAnswerEdit(lesson));
  } else {
    elements.lessonAnswer.innerHTML = renderMarkdownToHtml(lesson.answer);
  }
  elements.bookmarkLessonButton.classList.toggle('is-active', lessonState.bookmarked);
  elements.bookmarkLessonButton.setAttribute('aria-label', lessonState.bookmarked ? 'Remove bookmark' : 'Bookmark lesson');
  elements.bookmarkLessonButton.title = lessonState.bookmarked ? 'Edit bookmark label' : 'Bookmark lesson';
  renderSelectedBookmarkLabel(lesson, lessonState);

  elements.bookmarkLessonButton.onclick = (event) => {
    event.stopPropagation();
    bookmarkPickerOpen = !bookmarkPickerOpen;
    addingBookmarkLabel = false;
    renderBookmarkLabelPicker(lesson, lessonState);
  };
  renderBookmarkLabelPicker(lesson, lessonState);

  elements.completeLessonButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
    </svg>
    <span>${completingLessonId === lesson.id ? 'Completing...' : lessonState.completed ? 'Completed' : 'Mark as Complete'}</span>
  `;
  elements.completeLessonButton.classList.toggle('is-complete', lessonState.completed);
  elements.completeLessonButton.classList.toggle('is-completing', completingLessonId === lesson.id);
  elements.lessonStatusMicrocopy.textContent = lessonState.completed
    ? 'Locked in.'
    : 'Finish this one to keep momentum.';
  elements.lessonStatusMicrocopy.classList.toggle('is-complete', lessonState.completed);
  elements.completeLessonButton.onclick = () => {
    if (completingLessonId) return;
    const nextCompleted = !lessonState.completed;
    if (!nextCompleted) {
      state.lessonState[lesson.id] = { ...lessonState, completed: false };
      persist();
      render();
      patchLesson(lesson.id, { mark_as_complete: false }).catch((error) => {
        state.lessonState[lesson.id] = { ...state.lessonState[lesson.id], completed: true };
        render();
        console.error(error);
      });
      return;
    }

    completingLessonId = lesson.id;
    renderLessonCard();

    window.setTimeout(() => {
      state.lessonState[lesson.id] = { ...state.lessonState[lesson.id], completed: true };
      completingLessonId = null;
      persist();
      renderTopMeta();
      glowTopProgress();
      sprinkleProgress();
      renderModuleList();
      renderLessonCard();
      patchLesson(lesson.id, { mark_as_complete: true }).catch((error) => {
        state.lessonState[lesson.id] = { ...state.lessonState[lesson.id], completed: false };
        render();
        console.error(error);
      });

      const next = getAdjacentLessonIds(course, lesson.id).nextId;
      if (!next) return;
      elements.lessonCard.classList.add('is-advancing');
      window.setTimeout(() => {
        state.selectedLessonId = next;
        persist();
        render();
        elements.lessonColumn.scrollTo({ top: 0, behavior: 'smooth' });
        window.requestAnimationFrame(() => {
          elements.lessonCard.classList.add('is-entering');
        });
        window.setTimeout(() => elements.lessonCard.classList.remove('is-entering'), 360);
      }, 420);
    }, 1000);
  };

  const adjacent = getAdjacentLessonIds(course, lesson.id);
  elements.previousLessonButton.disabled = !adjacent.previousId;
  elements.nextLessonButton.disabled = !adjacent.nextId;
  elements.previousLessonButton.onclick = () => adjacent.previousId && setSelectedLesson(adjacent.previousId);
  elements.nextLessonButton.onclick = () => adjacent.nextId && setSelectedLesson(adjacent.nextId);

  elements.priorityCluster.innerHTML = '';
}

function renderNotesPanel() {
  const lessonId = state.selectedLessonId;
  const notes = getNotesForLesson(state, lessonId);
  elements.notesList.innerHTML = '';

  elements.notesEmptyState.classList.toggle('hidden', notes.length > 0 || state.noteEditorOpen);
  elements.noteEditor.classList.toggle('hidden', !state.noteEditorOpen);
  if (state.noteEditorOpen && !elements.noteTextarea.value) {
    elements.noteTextarea.value = state.noteDraft;
  }

  notes.forEach((note) => {
    const card = document.createElement('article');
    card.className = 'saved-note-card';
    card.innerHTML = `
      <p>${escapeHtml(note.content)}</p>
      <div class="saved-note-actions">
        <span>${new Date(note.updatedAt).toLocaleDateString()}</span>
        <div>
          <button data-note-edit="${note.id}" type="button">Edit</button>
          <button data-note-delete="${note.id}" type="button">Delete</button>
        </div>
      </div>
    `;
    elements.notesList.append(card);
  });

  [...elements.notesList.querySelectorAll('[data-note-edit]')].forEach((button) => {
    button.addEventListener('click', () => {
      const note = notes.find((item) => item.id === button.dataset.noteEdit);
      if (!note) return;
      state.noteEditorOpen = true;
      state.editingNoteId = note.id;
      state.noteDraft = note.content;
      elements.noteTextarea.value = note.content;
      renderNotesPanel();
    });
  });

  [...elements.notesList.querySelectorAll('[data-note-delete]')].forEach((button) => {
    button.addEventListener('click', () => {
      state.notes = state.notes.filter((item) => item.id !== button.dataset.noteDelete);
      persist();
      patchLesson(lessonId, { notes: getNotesForLesson(state, lessonId).map(({ lessonId: _lessonId, ...note }) => note) })
        .catch((error) => console.error(error));
      render();
    });
  });
}

function renderBookmarksPanel() {
  const bookmarkedLessons = flattenLessons(course).filter((lesson) => state.lessonState[lesson.id]?.bookmarked);
  const filterButtons = [
    { id: 'all', name: 'All', color: '#00c9b1', count: bookmarkedLessons.length },
    ...bookmarkLabels.map((label) => ({
      ...label,
      count: bookmarkedLessons.filter((lesson) => getBookmarkLabelIds(state.lessonState[lesson.id]).includes(label.id)).length,
    })),
  ];
  let activeFilterId = state.bookmarkLabelFilterId || 'all';
  if (!filterButtons.some((label) => label.id === activeFilterId)) {
    activeFilterId = 'all';
    state.bookmarkLabelFilterId = 'all';
  }
  const filteredLessons = activeFilterId === 'all'
    ? bookmarkedLessons
    : bookmarkedLessons.filter((lesson) => getBookmarkLabelIds(state.lessonState[lesson.id]).includes(activeFilterId));
  const activeFilter = filterButtons.find((label) => label.id === activeFilterId) || filterButtons[0];

  elements.bookmarkLabelFilters.innerHTML = `
    <label id="bookmarkLabelFilterLabel">Filter by label</label>
    <div class="bookmark-label-select ${bookmarkFilterOpen ? 'is-open' : ''}">
      <button
        id="bookmarkLabelFilterButton"
        class="bookmark-label-select-button"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="${bookmarkFilterOpen}"
        aria-labelledby="bookmarkLabelFilterLabel bookmarkLabelFilterButton"
      >
        <span class="bookmark-filter-value">
          ${activeFilter.id === 'all' ? '' : `<i style="background: ${escapeHtml(activeFilter.color || '#00c9b1')}"></i>`}
          <strong>${escapeHtml(activeFilter.name)}</strong>
        </span>
        <em>${activeFilter.count}</em>
      </button>
      <div class="bookmark-filter-menu ${bookmarkFilterOpen ? '' : 'hidden'}" role="listbox" aria-labelledby="bookmarkLabelFilterLabel">
        ${filterButtons.map((label) => `
          <button
            class="bookmark-filter-option ${activeFilterId === label.id ? 'is-selected' : ''}"
            data-bookmark-filter-id="${escapeHtml(label.id)}"
            type="button"
            role="option"
            aria-selected="${activeFilterId === label.id}"
          >
            <span class="bookmark-filter-value">
              ${label.id === 'all' ? '' : `<i style="background: ${escapeHtml(label.color || '#00c9b1')}"></i>`}
              <strong>${escapeHtml(label.name)}</strong>
            </span>
            <em>${label.count}</em>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="bookmark-label-counts" aria-label="Bookmark label counts">
      ${filterButtons.filter((label) => label.id !== 'all').map((label) => `
        <button
          class="bookmark-count-chip ${activeFilterId === label.id ? 'is-active' : ''}"
          data-bookmark-filter-id="${escapeHtml(label.id)}"
          type="button"
          title="${escapeHtml(label.name)} bookmarks"
        >
          <span style="background: ${escapeHtml(label.color || '#00c9b1')}"></span>
          <strong>${escapeHtml(label.name)}</strong>
          <em>${label.count}</em>
        </button>
      `).join('')}
    </div>
  `;

  elements.bookmarkLabelFilters.querySelector('#bookmarkLabelFilterButton')?.addEventListener('click', (event) => {
    event.stopPropagation();
    bookmarkFilterOpen = !bookmarkFilterOpen;
    renderBookmarksPanel();
  });

  elements.bookmarkLabelFilters.querySelectorAll('[data-bookmark-filter-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      state.bookmarkLabelFilterId = button.dataset.bookmarkFilterId;
      bookmarkFilterOpen = false;
      persist();
      renderBookmarksPanel();
    });
  });

  elements.bookmarkLabelFilters.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  elements.bookmarkLabelFilters.querySelector('.bookmark-filter-menu')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    bookmarkFilterOpen = false;
    persist();
    renderBookmarksPanel();
  });

  elements.bookmarksList.innerHTML = '';
  elements.bookmarksEmptyState.classList.toggle('hidden', filteredLessons.length > 0);
  elements.bookmarksEmptyState.querySelector('h3').textContent = bookmarkedLessons.length ? 'No bookmarks for this label' : 'No bookmarks yet';
  elements.bookmarksEmptyState.querySelector('p').textContent = bookmarkedLessons.length
    ? 'Choose another label or add this label to a lesson.'
    : 'Bookmark important lessons to revisit them quickly.';

  filteredLessons.forEach((lesson) => {
    const module = course.modules.find((item) => item.id === lesson.moduleId);
    const labels = getBookmarkLabels(state.lessonState[lesson.id]);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bookmark-row';
    button.innerHTML = `
      <div class="bookmark-row-title">${escapeHtml(lesson.title)}</div>
      <div class="bookmark-row-meta">
        <span>${escapeHtml(lesson.courseName || course.title)}</span>
        <span>${escapeHtml(module?.title || '')}</span>
      </div>
      <div class="bookmark-row-labels">
        ${renderLabelBadges(labels)}
      </div>
    `;
    button.addEventListener('click', () => {
      state.activeSideTab = 'bookmarks';
      setSelectedLesson(lesson.id);
    });
    elements.bookmarksList.append(button);
  });
}

function applyBookmarkAssignments(rows, assignments) {
  const labelsByQuestionId = assignments.reduce((lookup, assignment) => {
    if (!assignment.question_id || !assignment.label_id) return lookup;
    lookup[assignment.question_id] = [...(lookup[assignment.question_id] || []), assignment.label_id];
    return lookup;
  }, {});

  return rows.map((row) => {
    const assignmentLabelIds = labelsByQuestionId[row.id] || [];
    const fallbackLabelIds = row.bookmark_label_id ? [row.bookmark_label_id] : [];
    const bookmarkLabelIds = [...new Set([...assignmentLabelIds, ...fallbackLabelIds])];
    return {
      ...row,
      bookmark: row.bookmark || bookmarkLabelIds.length > 0,
      bookmark_label_ids: bookmarkLabelIds,
    };
  });
}

function renderSidePanel() {
  elements.notesTabButton.classList.toggle('is-active', state.activeSideTab === 'notes');
  elements.bookmarksTabButton.classList.toggle('is-active', state.activeSideTab === 'bookmarks');
  elements.notesPanel.classList.toggle('hidden', state.activeSideTab !== 'notes');
  elements.bookmarksPanel.classList.toggle('hidden', state.activeSideTab !== 'bookmarks');
  renderNotesPanel();
  renderBookmarksPanel();
}

function bindEvents() {
  elements.lessonSearchInput.addEventListener('input', (event) => {
    state.searchQuery = event.target.value;
    renderModuleList();
  });

  elements.navMyLearning.addEventListener('click', () => {
    state.sidebarMode = 'my-learning';
    state.myLearningExpanded = !state.myLearningExpanded;
    persist();
    render();
  });

  elements.addLessonsButton.addEventListener('click', openLessonImportDialog);
  elements.closeLessonImportButton.addEventListener('click', closeLessonImportDialog);
  elements.singleLessonModeButton.addEventListener('click', () => setLessonImportMode('single'));
  elements.bulkLessonModeButton.addEventListener('click', () => setLessonImportMode('bulk'));
  elements.lessonImportOverlay.addEventListener('click', (event) => {
    if (event.target === elements.lessonImportOverlay) {
      closeLessonImportDialog();
    }
  });

  elements.notesTabButton.addEventListener('click', () => {
    state.activeSideTab = 'notes';
    state.rightPanelCollapsed = false;
    persist();
    render();
  });

  elements.bookmarksTabButton.addEventListener('click', () => {
    state.activeSideTab = 'bookmarks';
    state.rightPanelCollapsed = false;
    persist();
    render();
  });

  elements.toggleLeftPanelButton.addEventListener('click', () => {
    state.leftPanelCollapsed = !state.leftPanelCollapsed;
    persist();
    renderSidebarNav();
  });

  elements.toggleRightPanelButton.addEventListener('click', () => {
    state.rightPanelCollapsed = !state.rightPanelCollapsed;
    persist();
    renderSidebarNav();
  });

  elements.newNoteButton.addEventListener('click', () => {
    state.noteEditorOpen = true;
    state.editingNoteId = null;
    state.noteDraft = '';
    elements.noteTextarea.value = '';
    renderNotesPanel();
  });

  elements.noteTextarea.addEventListener('input', (event) => {
    state.noteDraft = event.target.value;
  });

  elements.cancelNoteButton.addEventListener('click', () => {
    state.noteEditorOpen = false;
    state.editingNoteId = null;
    state.noteDraft = '';
    elements.noteTextarea.value = '';
    renderNotesPanel();
  });

  elements.saveNoteButton.addEventListener('click', () => {
    const lessonId = state.selectedLessonId;
    const content = state.noteDraft.trim();
    if (!lessonId || !content) return;

    if (state.editingNoteId) {
      state.notes = state.notes.map((note) => note.id === state.editingNoteId
        ? { ...note, content, updatedAt: new Date().toISOString() }
        : note);
    } else {
      state.notes = [
        {
          id: `note-${Date.now()}`,
          lessonId,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.notes,
      ];
    }

    state.noteEditorOpen = false;
    state.editingNoteId = null;
    state.noteDraft = '';
    elements.noteTextarea.value = '';
    persist();
    patchLesson(lessonId, { notes: getNotesForLesson(state, lessonId).map(({ lessonId: _lessonId, ...note }) => note) })
      .catch((error) => console.error(error));
    renderSidePanel();
  });

  document.addEventListener('click', (event) => {
    if (bookmarkFilterOpen && !event.target.closest('.bookmark-label-filters')) {
      bookmarkFilterOpen = false;
      renderBookmarksPanel();
    }
    if (!bookmarkPickerOpen || event.target.closest('.bookmark-control')) return;
    bookmarkPickerOpen = false;
    addingBookmarkLabel = false;
    renderLessonCard();
  });
}

function render() {
  renderTopMeta();
  renderSidebarNav();
  renderModuleList();
  renderLessonCard();
  renderSidePanel();
  renderLessonImportDialog();
}

async function init() {
  try {
    elements.lessonEmptyState.classList.remove('hidden');
    elements.lessonEmptyState.querySelector('h1').textContent = 'Loading lessons...';
    elements.lessonEmptyState.querySelector('p:last-child').textContent = 'Fetching questions and progress from Supabase.';
    const [rows, labels, assignments] = await Promise.all([
      fetchInterviewQuestions(),
      fetchBookmarkLabels(),
      fetchBookmarkLabelAssignments(),
    ]);
    allQuestionRows = rows;
    allBookmarkAssignments = assignments;
    courseSummaries = getCourseSummaries(rows);
    bookmarkLabels = labels;
    const savedState = loadLearningState();
    const savedCourseName = courseSummaries.some((summary) => summary.name === savedState.selectedCourseName)
      ? savedState.selectedCourseName
      : courseSummaries[0]?.name;
    setActiveCourse(savedCourseName, { keepSearch: true });
    bindEvents();
    render();
  } catch (error) {
    console.error(error);
    elements.lessonCard.classList.add('hidden');
    elements.lessonEmptyState.classList.remove('hidden');
    elements.lessonEmptyState.querySelector('h1').textContent = 'Could not load lessons.';
    elements.lessonEmptyState.querySelector('p:last-child').textContent = error.message;
  }
}

init();
