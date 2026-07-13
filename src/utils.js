export function loadLearningState() {
  try {
    return JSON.parse(localStorage.getItem('archelon-learning-state-v2')) || {};
  } catch {
    return {};
  }
}

export function saveLearningState(state) {
  localStorage.setItem('archelon-learning-state-v2', JSON.stringify({
    expandedModuleIds: state.expandedModuleIds,
    selectedLessonId: state.selectedLessonId,
    selectedCourseName: state.selectedCourseName,
    activeSideTab: state.activeSideTab,
    sidebarMode: state.sidebarMode,
    myLearningExpanded: state.myLearningExpanded,
    leftPanelCollapsed: state.leftPanelCollapsed,
    rightPanelCollapsed: state.rightPanelCollapsed,
    bookmarkLabelFilterId: state.bookmarkLabelFilterId,
  }));
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeModule(value) {
  return String(value || '').trim() || 'General';
}

function normalizeNotes(notes, lessonId) {
  if (!Array.isArray(notes)) return [];
  return notes.map((note, index) => ({
    id: note.id || `note-${lessonId}-${index}`,
    lessonId,
    content: note.content || '',
    createdAt: note.createdAt || note.created_at || new Date().toISOString(),
    updatedAt: note.updatedAt || note.updated_at || new Date().toISOString(),
  })).filter((note) => note.content.trim());
}

function normalizeBookmarkLabelIds(item) {
  if (Array.isArray(item.bookmark_label_ids)) {
    return item.bookmark_label_ids.filter(Boolean);
  }
  return item.bookmark_label_id ? [item.bookmark_label_id] : [];
}

export function buildLearningCourse(rawQuestions) {
  const questions = rawQuestions
    .map((item, index) => ({
    id: item.id || `lesson-${index + 1}`,
    number: item.order_index || index + 1,
    orderIndex: item.order_index || index + 1,
    title: item.question,
    question: item.question,
    answer: item.answer,
    courseName: item.course_name || 'Claude + Codex Interview Questions',
    module: normalizeModule(item.module || item.type),
    category: item.category || 'Uncategorized',
    tags: Array.isArray(item.tags) ? item.tags : [],
    completed: !!item.mark_as_complete,
    bookmarked: !!item.bookmark,
    bookmarkLabelId: item.bookmark_label_id || null,
    bookmarkLabelIds: normalizeBookmarkLabelIds(item),
    notes: normalizeNotes(item.notes, item.id || `lesson-${index + 1}`),
  }))
    .sort((left, right) => left.number - right.number);

  const moduleNames = [...new Set(questions.map((question) => question.module))];
  const modules = moduleNames.map((moduleName, index) => {
    const moduleId = `module-${index + 1}-${slugify(moduleName) || 'general'}`;
    const lessonsForModule = questions.filter((question) => question.module === moduleName);
    const displayNumberById = new Map(lessonsForModule.map((question, index) => [question.id, index + 1]));
    const categoryTitles = [...new Set(lessonsForModule.map((question) => question.category))];
    return {
      id: moduleId,
      title: `Module ${index + 1}: ${moduleName}`,
      subtitle: moduleName,
      module: moduleName,
      categories: categoryTitles.map((categoryTitle) => ({
        id: `${moduleId}-${slugify(categoryTitle) || 'category'}`,
        title: categoryTitle,
        lessons: lessonsForModule
          .filter((question) => question.category === categoryTitle)
          .map((question) => ({
            ...question,
            displayNumber: displayNumberById.get(question.id),
            moduleId,
          })),
      })),
    };
  }).filter((module) => module.categories.some((category) => category.lessons.length));

  return {
    id: 'archelon-interview-course',
    title: questions[0]?.courseName || 'Claude + Codex Interview Questions',
    modules,
  };
}

export function flattenLessons(course) {
  return course.modules.flatMap((module) => module.categories.flatMap((category) => category.lessons));
}

export function getLessonById(course, lessonId) {
  return flattenLessons(course).find((lesson) => lesson.id === lessonId) || null;
}

export function buildState(rawState, course) {
  const lessons = flattenLessons(course);
  const courseModuleIds = course.modules.map((module) => module.id);
  const savedExpandedModuleIds = Array.isArray(rawState.expandedModuleIds)
    ? rawState.expandedModuleIds.filter((id) => courseModuleIds.includes(id))
    : [];
  const lessonState = {};
  lessons.forEach((lesson) => {
    lessonState[lesson.id] = {
      completed: lesson.completed,
      bookmarked: lesson.bookmarked,
      bookmarkLabelId: lesson.bookmarkLabelId,
      bookmarkLabelIds: lesson.bookmarkLabelIds,
      priority: 'none',
    };
  });

  const selectedLessonExists = lessons.some((lesson) => lesson.id === rawState.selectedLessonId);

  return {
    lessonState,
    notes: lessons.flatMap((lesson) => lesson.notes || []),
    expandedModuleIds: savedExpandedModuleIds.length ? savedExpandedModuleIds : courseModuleIds,
    selectedLessonId: selectedLessonExists ? rawState.selectedLessonId : lessons[0]?.id || null,
    selectedCourseName: rawState.selectedCourseName || course.title,
    activeSideTab: rawState.activeSideTab || 'notes',
    sidebarMode: rawState.sidebarMode || 'my-learning',
    myLearningExpanded: rawState.myLearningExpanded !== false,
    leftPanelCollapsed: !!rawState.leftPanelCollapsed,
    rightPanelCollapsed: !!rawState.rightPanelCollapsed,
    searchQuery: '',
    noteEditorOpen: false,
    noteDraft: '',
    editingNoteId: null,
    bookmarkLabelFilterId: rawState.bookmarkLabelFilterId || 'all',
  };
}

export function getVisibleModules(course, state) {
  const search = state.searchQuery.trim().toLowerCase();

  return course.modules.map((module) => ({
    ...module,
    categories: module.categories.map((category) => ({
      ...category,
      lessons: category.lessons.filter((lesson) => {
        if (!search) return true;
        const haystack = [lesson.title, lesson.category, lesson.module, ...(lesson.tags || [])].join(' ').toLowerCase();
        return haystack.includes(search);
      }),
    })).filter((category) => category.lessons.length),
  })).filter((module) => module.categories.length);
}

export function getModuleCompletion(module, state) {
  const lessons = module.categories.flatMap((category) => category.lessons);
  const completed = lessons.filter((lesson) => state.lessonState[lesson.id]?.completed).length;
  return { completed, total: lessons.length };
}

export function getCompletedCount(course, state) {
  return flattenLessons(course).filter((lesson) => state.lessonState[lesson.id]?.completed).length;
}

export function getProgressPercent(course, state) {
  const lessons = flattenLessons(course);
  if (!lessons.length) return 0;
  return Math.round((getCompletedCount(course, state) / lessons.length) * 100);
}

export function getAdjacentLessonIds(course, lessonId) {
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return {
    previousId: index > 0 ? lessons[index - 1].id : null,
    nextId: index >= 0 && index < lessons.length - 1 ? lessons[index + 1].id : null,
  };
}

export function getNotesForLesson(state, lessonId) {
  return state.notes
    .filter((note) => note.lessonId === lessonId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function renderMarkdownToHtml(markdown) {
  const tokens = markdown.split(/```/g);
  const fragments = [];

  tokens.forEach((token, index) => {
    if (index % 2 === 1) {
      const lines = token.split('\n');
      const language = lines[0].trim();
      const code = lines.slice(1).join('\n').trimEnd();
      fragments.push(`<pre><code class="language-${escapeHtml(language)}">${escapeHtml(code)}</code></pre>`);
      return;
    }

    const blocks = token.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    blocks.forEach((block) => {
      const lines = block.split('\n');
      if (lines.every((line) => /^-\s+/.test(line))) {
        fragments.push(`<ul>${lines.map((line) => `<li>${formatInline(line.replace(/^-\s+/, ''))}</li>`).join('')}</ul>`);
        return;
      }
      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        fragments.push(`<ol>${lines.map((line) => `<li>${formatInline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`);
        return;
      }
      if (lines.length === 1 && /^\*\*.+\*\*$/.test(lines[0])) {
        fragments.push(`<h4>${formatInline(lines[0].replace(/^\*\*(.+)\*\*$/, '$1'))}</h4>`);
        return;
      }
      fragments.push(`<p>${formatInline(lines.join('\n')).replace(/\n/g, '<br />')}</p>`);
    });
  });

  return fragments.join('');
}
