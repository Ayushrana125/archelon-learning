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
  fetchBookmarkLabelByName,
  fetchBookmarkLabelAssignments,
  fetchBookmarkLabels,
  fetchInterviewQuestions,
  removeBookmarkLabelAssignment,
  updateInterviewQuestion,
} from './supabaseApi.js';

let course = { id: 'archelon-interview-course', title: 'Archelon Learning', modules: [] };
let state = buildState(loadLearningState(), course);
let completingLessonId = null;
let bookmarkLabels = [];
let bookmarkPickerOpen = false;
let bookmarkFilterOpen = false;
let addingBookmarkLabel = false;
let selectedLabelColor = '#00c9b1';
let bookmarkLabelDraftName = '';
let bookmarkLabelError = '';
let savingBookmarkLabel = false;

const labelColors = ['#00c9b1', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const elements = {
  app: document.getElementById('app'),
  lessonSearchInput: document.getElementById('lessonSearchInput'),
  navMyLearning: document.getElementById('navMyLearning'),
  myLearningChevron: document.getElementById('myLearningChevron'),
  myLearningContent: document.getElementById('myLearningContent'),
  courseNavItem: document.getElementById('courseNavItem'),
  courseNameLabel: document.getElementById('courseNameLabel'),
  courseMetaLabel: document.getElementById('courseMetaLabel'),
  learningSidebar: document.getElementById('learningSidebar'),
  lessonColumn: document.querySelector('.lesson-column'),
  sidePanel: document.getElementById('sidePanel'),
  toggleLeftPanelButton: document.getElementById('toggleLeftPanelButton'),
  toggleRightPanelButton: document.getElementById('toggleRightPanelButton'),
  moduleMetaLabel: document.getElementById('moduleMetaLabel'),
  moduleAccordionList: document.getElementById('moduleAccordionList'),
  topbarCourseName: document.getElementById('topbarCourseName'),
  overallProgressPercent: document.getElementById('overallProgressPercent'),
  overallProgressFill: document.getElementById('overallProgressFill'),
  overallProgressText: document.getElementById('overallProgressText'),
  breadcrumbRow: document.getElementById('breadcrumbRow'),
  lessonCard: document.getElementById('lessonCard'),
  lessonEmptyState: document.getElementById('lessonEmptyState'),
  lessonQuestion: document.getElementById('lessonQuestion'),
  lessonTags: document.getElementById('lessonTags'),
  lessonAnswer: document.getElementById('lessonAnswer'),
  bookmarkLessonButton: document.getElementById('bookmarkLessonButton'),
  selectedBookmarkLabel: document.getElementById('selectedBookmarkLabel'),
  bookmarkLabelPicker: document.getElementById('bookmarkLabelPicker'),
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
};

function persist() {
  saveLearningState(state);
}

async function patchLesson(lessonId, patch) {
  const updated = await updateInterviewQuestion(lessonId, patch);
  return updated;
}

function setSelectedLesson(lessonId) {
  state.selectedLessonId = lessonId;
  bookmarkPickerOpen = false;
  addingBookmarkLabel = false;
  persist();
  render();
}

function renderTopMeta() {
  const totalLessons = flattenLessons(course).length;
  const completedCount = getCompletedCount(course, state);
  const progressPercent = getProgressPercent(course, state);
  elements.moduleMetaLabel.textContent = `${totalLessons} lessons`;
  elements.topbarCourseName.textContent = course.title;
  elements.courseNameLabel.textContent = course.title;
  elements.courseMetaLabel.textContent = `${totalLessons} lessons`;
  elements.overallProgressPercent.textContent = `${progressPercent}%`;
  elements.overallProgressFill.style.width = `${progressPercent}%`;
  elements.overallProgressText.textContent = `${completedCount} / ${totalLessons} lessons completed`;
}

function renderSidebarNav() {
  elements.navMyLearning.classList.toggle('is-active', state.sidebarMode === 'my-learning');
  elements.myLearningContent.classList.toggle('hidden', !state.myLearningExpanded);
  elements.myLearningChevron.classList.toggle('is-open', state.myLearningExpanded);

  elements.learningSidebar.classList.toggle('is-collapsed', state.leftPanelCollapsed);
  elements.sidePanel.classList.toggle('is-collapsed', state.rightPanelCollapsed);
  elements.app.classList.toggle('left-collapsed', state.leftPanelCollapsed);
  elements.app.classList.toggle('right-collapsed', state.rightPanelCollapsed);
  elements.toggleLeftPanelButton.setAttribute('aria-label', state.leftPanelCollapsed ? 'Expand lesson list' : 'Collapse lesson list');
  elements.toggleLeftPanelButton.title = state.leftPanelCollapsed ? 'Expand lesson list' : 'Collapse lesson list';
  elements.toggleLeftPanelButton.innerHTML = state.leftPanelCollapsed
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" /></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" /></svg>';
  elements.toggleRightPanelButton.setAttribute('aria-label', state.rightPanelCollapsed ? 'Expand notes panel' : 'Collapse notes panel');
  elements.toggleRightPanelButton.title = state.rightPanelCollapsed ? 'Expand notes panel' : 'Collapse notes panel';
  elements.toggleRightPanelButton.innerHTML = state.rightPanelCollapsed
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" /></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" /></svg>';
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
        <button class="bookmark-label-option ${selectedLabelIds.includes(label.id) ? 'is-selected' : ''}" data-label-id="${escapeHtml(label.id)}" type="button">
          <span class="label-dot" style="background: ${escapeHtml(label.color || '#00c9b1')}"></span>
          <span>${escapeHtml(label.name)}</span>
          <span class="label-check">${selectedLabelIds.includes(label.id) ? 'On' : ''}</span>
        </button>
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

  elements.lessonQuestion.textContent = lesson.question;
  const tags = Array.isArray(lesson.tags) ? lesson.tags.filter(Boolean) : [];
  elements.lessonTags.classList.toggle('hidden', !tags.length);
  elements.lessonTags.innerHTML = tags
    .slice(0, 6)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');
  elements.lessonAnswer.innerHTML = renderMarkdownToHtml(lesson.answer);
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

  elements.courseNavItem.addEventListener('click', () => {
    state.sidebarMode = 'my-learning';
    state.myLearningExpanded = true;
    const firstLesson = flattenLessons(course)[0];
    if (firstLesson) state.selectedLessonId = firstLesson.id;
    persist();
    render();
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
    course = buildLearningCourse(applyBookmarkAssignments(rows, assignments));
    bookmarkLabels = labels;
    state = buildState(loadLearningState(), course);
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
