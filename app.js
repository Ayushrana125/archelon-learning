const STORAGE_KEY = 'archelon-learning-state-v1';
const questions = Array.isArray(window.__ARCHELON_INTERVIEW_QA__) ? window.__ARCHELON_INTERVIEW_QA__ : [];

const elements = {
  navTabs: [...document.querySelectorAll('.nav-tab')],
  dashboardView: document.getElementById('dashboardView'),
  studyView: document.getElementById('studyView'),
  questionList: document.getElementById('questionList'),
  questionCountChip: document.getElementById('questionCountChip'),
  visibleCountLabel: document.getElementById('visibleCountLabel'),
  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  priorityFilter: document.getElementById('priorityFilter'),
  typeFilter: document.getElementById('typeFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  clearFiltersButton: document.getElementById('clearFiltersButton'),
  jumpToFocusButton: document.getElementById('jumpToFocusButton'),
  continueButton: document.getElementById('continueButton'),
  overallProgressLabel: document.getElementById('overallProgressLabel'),
  overallProgressFill: document.getElementById('overallProgressFill'),
  progressMeta: document.getElementById('progressMeta'),
  statsGrid: document.getElementById('statsGrid'),
  priorityQueue: document.getElementById('priorityQueue'),
  categoryProgress: document.getElementById('categoryProgress'),
  bookmarkPreview: document.getElementById('bookmarkPreview'),
  notesSummary: document.getElementById('notesSummary'),
  emptyState: document.getElementById('emptyState'),
  questionDetail: document.getElementById('questionDetail'),
  questionMetaLine: document.getElementById('questionMetaLine'),
  questionTitle: document.getElementById('questionTitle'),
  questionMetaChips: document.getElementById('questionMetaChips'),
  markReadButton: document.getElementById('markReadButton'),
  bookmarkButton: document.getElementById('bookmarkButton'),
  priorityButtons: document.getElementById('priorityButtons'),
  answerContent: document.getElementById('answerContent'),
  notesInput: document.getElementById('notesInput'),
  notesStatus: document.getElementById('notesStatus'),
};

const defaults = questions.reduce((acc, _, index) => {
  acc[index] = { read: false, bookmarked: false, priority: 'none', notes: '' };
  return acc;
}, {});

const persisted = loadState();

const state = {
  view: 'dashboard',
  selectedIndex: 0,
  query: '',
  status: 'all',
  priority: 'all',
  type: 'all',
  category: 'all',
  progress: { ...defaults, ...(persisted.progress || {}) },
};

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress: state.progress }));
}

function getQuestionState(index) {
  return state.progress[index] || defaults[index];
}

function setView(nextView) {
  state.view = nextView;
  elements.navTabs.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === nextView);
  });
  elements.dashboardView.classList.toggle('is-visible', nextView === 'dashboard');
  elements.studyView.classList.toggle('is-visible', nextView === 'study');
}

function populateFilterOptions() {
  const types = [...new Set(questions.map((item) => item.type).filter(Boolean))];
  const categories = [...new Set(questions.map((item) => item.category).filter(Boolean))];

  types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    elements.typeFilter.append(option);
  });

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.append(option);
  });
}

function filteredQuestions() {
  const query = state.query.trim().toLowerCase();

  return questions
    .map((question, index) => ({ question, index, meta: getQuestionState(index) }))
    .filter(({ question, meta }) => {
      if (state.status === 'read' && !meta.read) return false;
      if (state.status === 'unread' && meta.read) return false;
      if (state.status === 'bookmarked' && !meta.bookmarked) return false;
      if (state.priority !== 'all' && meta.priority !== state.priority) return false;
      if (state.priority === 'none' && meta.priority !== 'none') return false;
      if (state.type !== 'all' && question.type !== state.type) return false;
      if (state.category !== 'all' && question.category !== state.category) return false;
      if (!query) return true;

      const haystack = [
        question.question,
        question.answer,
        question.type,
        question.category,
        ...(Array.isArray(question.tags) ? question.tags : []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
}

function getStats() {
  const total = questions.length;
  const entries = questions.map((_, index) => getQuestionState(index));
  const read = entries.filter((item) => item.read).length;
  const bookmarked = entries.filter((item) => item.bookmarked).length;
  const noteCount = entries.filter((item) => item.notes.trim()).length;
  const p0 = entries.filter((item) => item.priority === 'P0').length;
  const p1 = entries.filter((item) => item.priority === 'P1').length;
  const p2 = entries.filter((item) => item.priority === 'P2').length;
  const progressPercent = total ? Math.round((read / total) * 100) : 0;
  return { total, read, bookmarked, noteCount, p0, p1, p2, progressPercent, remaining: total - read };
}

function renderQuestionList() {
  const items = filteredQuestions();
  elements.questionList.innerHTML = '';
  elements.questionCountChip.textContent = String(questions.length);
  elements.visibleCountLabel.textContent = `${items.length} shown`;

  if (!items.length) {
    elements.emptyState.classList.remove('hidden');
    elements.questionDetail.classList.add('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');

  if (!items.some((item) => item.index === state.selectedIndex)) {
    state.selectedIndex = items[0].index;
  }

  items.forEach(({ question, index, meta }) => {
    const button = document.createElement('button');
    button.className = `question-item${index === state.selectedIndex ? ' is-active' : ''}`;
    button.type = 'button';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', index === state.selectedIndex ? 'true' : 'false');
    button.innerHTML = `
      <div class="question-item-top">
        <span class="question-index">${index + 1}</span>
        <span class="status-dot ${meta.read ? 'is-read' : ''}" aria-hidden="true"></span>
      </div>
      <p class="question-title">${escapeHtml(question.question)}</p>
      <div class="question-item-bottom">
        <span class="pill">${escapeHtml(question.type || 'Unknown')}</span>
        <span class="priority-pill" data-priority="${meta.priority}">${meta.priority === 'none' ? 'No priority' : meta.priority}</span>
      </div>
    `;
    button.addEventListener('click', () => {
      state.selectedIndex = index;
      setView('study');
      render();
    });
    elements.questionList.append(button);
  });

  renderSelectedQuestion();
}

function renderDashboard() {
  const stats = getStats();
  const cards = [
    ['Completed', stats.read, `${stats.progressPercent}% of total finished`],
    ['Remaining', stats.remaining, 'Still waiting for a clean answer run'],
    ['Bookmarked', stats.bookmarked, 'Questions you marked for quick returns'],
    ['Notes', stats.noteCount, 'Answers with your own phrasing attached'],
  ];

  elements.statsGrid.innerHTML = cards.map(([label, value, copy]) => `
    <article class="stat-card">
      <div class="stat-card-top">
        <span class="label">${label}</span>
      </div>
      <p class="stat-value">${value}</p>
      <p class="muted">${copy}</p>
    </article>
  `).join('');

  const queue = questions
    .map((question, index) => ({ question, index, meta: getQuestionState(index) }))
    .filter(({ meta }) => !meta.read || meta.priority === 'P0' || meta.priority === 'P1')
    .sort((left, right) => priorityWeight(left.meta.priority) - priorityWeight(right.meta.priority) || left.index - right.index)
    .slice(0, 8);

  elements.priorityQueue.innerHTML = queue.length
    ? queue.map(({ question, index, meta }) => `
      <button class="queue-item" data-select-question="${index}">
        <div class="queue-item-top">
          <strong>#${index + 1}</strong>
          <span class="priority-pill" data-priority="${meta.priority}">${meta.priority === 'none' ? 'Open' : meta.priority}</span>
        </div>
        <p class="question-title">${escapeHtml(question.question)}</p>
      </button>
    `).join('')
    : '<div class="stack-item"><p class="muted">Everything is read. Nice problem to have.</p></div>';

  const byCategory = aggregateByCategory();
  elements.categoryProgress.innerHTML = byCategory.map((item) => `
    <div class="stack-item">
      <div class="mini-row">
        <strong>${escapeHtml(item.category)}</strong>
        <span class="muted">${item.read}/${item.total}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${item.percent}%"></div></div>
    </div>
  `).join('');

  const bookmarks = questions
    .map((question, index) => ({ question, index, meta: getQuestionState(index) }))
    .filter(({ meta }) => meta.bookmarked)
    .slice(0, 6);

  elements.bookmarkPreview.innerHTML = bookmarks.length
    ? bookmarks.map(({ question, index }) => `
      <button class="stack-item" data-select-question="${index}">
        <div class="mini-row">
          <strong>#${index + 1}</strong>
          <span class="muted">${escapeHtml(question.type)}</span>
        </div>
        <p class="question-title">${escapeHtml(question.question)}</p>
      </button>
    `).join('')
    : '<div class="stack-item"><p class="muted">No bookmarks yet. Use them to build a quick-revision lane.</p></div>';

  const notes = questions
    .map((question, index) => ({ question, index, meta: getQuestionState(index) }))
    .filter(({ meta }) => meta.notes.trim())
    .slice(0, 6);

  elements.notesSummary.innerHTML = notes.length
    ? notes.map(({ question, index, meta }) => `
      <button class="stack-item" data-select-question="${index}">
        <div class="mini-row">
          <strong>#${index + 1}</strong>
          <span class="muted">${meta.notes.trim().length} chars</span>
        </div>
        <p class="question-title">${escapeHtml(question.question)}</p>
      </button>
    `).join('')
    : '<div class="stack-item"><p class="muted">No personal notes yet. Add your own voice to the important answers.</p></div>';

  attachSelectQuestionHandlers();
}

function aggregateByCategory() {
  const map = new Map();
  questions.forEach((question, index) => {
    const category = question.category || 'Uncategorized';
    const existing = map.get(category) || { category, total: 0, read: 0 };
    existing.total += 1;
    if (getQuestionState(index).read) existing.read += 1;
    map.set(category, existing);
  });
  return [...map.values()]
    .map((item) => ({ ...item, percent: item.total ? Math.round((item.read / item.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
}

function renderSelectedQuestion() {
  const question = questions[state.selectedIndex];
  if (!question) return;

  const meta = getQuestionState(state.selectedIndex);
  elements.questionDetail.classList.remove('hidden');
  elements.questionMetaLine.textContent = `${question.category || 'General'} | ${question.type || 'Unknown'} | Question ${state.selectedIndex + 1}`;
  elements.questionTitle.textContent = question.question;
  elements.questionMetaChips.innerHTML = [
    `<span class="pill">${escapeHtml(question.type || 'Unknown')}</span>`,
    `<span class="pill">${escapeHtml(question.category || 'Uncategorized')}</span>`,
    ...(Array.isArray(question.tags) ? question.tags.slice(0, 6).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`) : []),
  ].join('');

  elements.markReadButton.textContent = meta.read ? 'Mark unread' : 'Mark as read';
  elements.bookmarkButton.textContent = meta.bookmarked ? 'Remove bookmark' : 'Bookmark';

  elements.markReadButton.onclick = () => {
    state.progress[state.selectedIndex] = { ...meta, read: !meta.read };
    saveState();
    render();
  };

  elements.bookmarkButton.onclick = () => {
    state.progress[state.selectedIndex] = { ...meta, bookmarked: !meta.bookmarked };
    saveState();
    render();
  };

  renderPriorityButtons(meta.priority);
  renderMarkdown(question.answer || '');
  elements.notesInput.value = meta.notes || '';
  elements.notesStatus.textContent = meta.notes.trim()
    ? `Saved locally | ${meta.notes.trim().length} characters`
    : 'Saved locally in this browser';
}

function renderPriorityButtons(activePriority) {
  const options = ['P0', 'P1', 'P2', 'none'];
  elements.priorityButtons.innerHTML = options.map((priority) => `
    <button class="priority-button ${priority === activePriority ? 'is-active' : ''}" data-priority="${priority}">
      ${priority === 'none' ? 'No priority' : priority}
    </button>
  `).join('');

  [...elements.priorityButtons.querySelectorAll('.priority-button')].forEach((button) => {
    button.addEventListener('click', () => {
      const meta = getQuestionState(state.selectedIndex);
      state.progress[state.selectedIndex] = { ...meta, priority: button.dataset.priority };
      saveState();
      render();
    });
  });
}

function renderMarkdown(markdown) {
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

  elements.answerContent.innerHTML = fragments.join('');
}

function formatInline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function priorityWeight(priority) {
  if (priority === 'P0') return 0;
  if (priority === 'P1') return 1;
  if (priority === 'P2') return 2;
  return 3;
}

function attachSelectQuestionHandlers() {
  [...document.querySelectorAll('[data-select-question]')].forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedIndex = Number(button.dataset.selectQuestion);
      setView('study');
      render();
    });
  });
}

function updateProgressHeader() {
  const stats = getStats();
  elements.overallProgressLabel.textContent = `${stats.progressPercent}%`;
  elements.overallProgressFill.style.width = `${stats.progressPercent}%`;
  elements.progressMeta.textContent = `${stats.read} of ${stats.total} questions marked as read`;
}

function bindEvents() {
  elements.navTabs.forEach((button) => {
    button.addEventListener('click', () => {
      setView(button.dataset.view);
    });
  });

  elements.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderQuestionList();
  });

  elements.statusFilter.addEventListener('change', (event) => {
    state.status = event.target.value;
    renderQuestionList();
  });

  elements.priorityFilter.addEventListener('change', (event) => {
    state.priority = event.target.value;
    renderQuestionList();
  });

  elements.typeFilter.addEventListener('change', (event) => {
    state.type = event.target.value;
    renderQuestionList();
  });

  elements.categoryFilter.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderQuestionList();
  });

  elements.clearFiltersButton.addEventListener('click', () => {
    state.query = '';
    state.status = 'all';
    state.priority = 'all';
    state.type = 'all';
    state.category = 'all';
    elements.searchInput.value = '';
    elements.statusFilter.value = 'all';
    elements.priorityFilter.value = 'all';
    elements.typeFilter.value = 'all';
    elements.categoryFilter.value = 'all';
    renderQuestionList();
  });

  elements.jumpToFocusButton.addEventListener('click', () => {
    state.priority = 'P0';
    elements.priorityFilter.value = 'P0';
    renderQuestionList();
  });

  elements.continueButton.addEventListener('click', () => {
    const next = questions.findIndex((_, index) => !getQuestionState(index).read);
    state.selectedIndex = next >= 0 ? next : 0;
    setView('study');
    render();
  });

  elements.notesInput.addEventListener('input', (event) => {
    const meta = getQuestionState(state.selectedIndex);
    state.progress[state.selectedIndex] = { ...meta, notes: event.target.value };
    saveState();
    elements.notesStatus.textContent = `Saved locally | ${event.target.value.trim().length} characters`;
    renderDashboard();
  });
}

function render() {
  updateProgressHeader();
  renderDashboard();
  renderQuestionList();
}

populateFilterOptions();
bindEvents();
setView('dashboard');
render();
