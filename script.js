const defaultData = [
    { id: 1, text: "Python: Basics & OOP", phase: "phase1", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 2, text: "C++: Pointers & Memory", phase: "phase1", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 3, text: "Linux: CLI & Shell Scripting", phase: "phase1", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 4, text: "Git: Version Control", phase: "phase1", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 5, text: "Data Structures & Algorithms", phase: "phase1", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 6, text: "Math: Linear Algebra & Calculus", phase: "phase1", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },

    { id: 7, text: "ROS 2: Topics & Services", phase: "phase2", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 8, text: "ROS 2: Actions & Parameters", phase: "phase2", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 9, text: "URDF & Robot Modeling", phase: "phase2", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 10, text: "Gazebo Simulation", phase: "phase2", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 11, text: "TF2: Coordinate Transforms", phase: "phase2", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },

    { id: 12, text: "UART, I2C, SPI, CAN", phase: "phase3", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 13, text: "Microcontroller Programming", phase: "phase3", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 14, text: "Sensor Integration", phase: "phase3", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 15, text: "Motor Control & PWM", phase: "phase3", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },

    { id: 16, text: "Nav2: Autonomous Pathing", phase: "phase4", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 17, text: "Computer Vision: OpenCV", phase: "phase4", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 18, text: "SLAM: Mapping & Localization", phase: "phase4", completed: false, priority: "high", logEntries: [], tags: [], dueDate: null },
    { id: 19, text: "Machine Learning Basics", phase: "phase4", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null },
    { id: 20, text: "ROS 2 Control Framework", phase: "phase4", completed: false, priority: "normal", logEntries: [], tags: [], dueDate: null }
];

let tasks = [];
let meetings = [];
let history = [];
let searchQuery = '';
let activeFilter = 'all';
let activeTagFilter = null;
let editingMeetingId = null;

const phases = {
    phase1: { title: "PHASE I: FOUNDATIONS", icon: "fa-cube" },
    phase2: { title: "PHASE II: ROS 2 CORE", icon: "fa-robot" },
    phase3: { title: "PHASE III: HARDWARE", icon: "fa-microchip" },
    phase4: { title: "PHASE IV: ADVANCED", icon: "fa-rocket" }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
}

function formatDueDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getAllTags() {
    const tags = new Set();
    tasks.forEach(t => (t.tags || []).forEach(tag => tags.add(tag)));
    return [...tags].sort();
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    renderTasks();
    renderMeetings();
    updateProgress();
    renderTagFilterRow();
    setupEventListeners();

    const now = new Date();
    document.getElementById('meetingDate').valueAsDate = now;
    document.getElementById('meetingTime').value = now.toTimeString().slice(0, 5);
});

function setupEventListeners() {
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

    document.getElementById('searchInput').addEventListener('input', e => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });
    document.getElementById('clearSearchBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        searchQuery = '';
        renderTasks();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    document.getElementById('clearTagFilter').addEventListener('click', () => {
        activeTagFilter = null;
        document.getElementById('clearTagFilter').style.display = 'none';
        document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
        renderTasks();
    });

    document.getElementById('resetBtn').addEventListener('click', resetToDefault);
    document.getElementById('undoBtn').addEventListener('click', undo);

    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('exportMdBtn').addEventListener('click', exportMarkdown);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', importData);

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    document.getElementById('addMeetingBtn').addEventListener('click', showMeetingForm);
    document.getElementById('saveMeetingBtn').addEventListener('click', saveMeeting);
    document.getElementById('cancelMeetingBtn').addEventListener('click', hideMeetingForm);

    document.getElementById('saveEditMeetingBtn').addEventListener('click', saveEditMeeting);
    document.getElementById('cancelEditMeetingBtn').addEventListener('click', hideEditMeetingForm);

    document.getElementById('meetingSearchInput').addEventListener('input', e => {
        renderMeetings(e.target.value.toLowerCase());
    });

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
    });
}

// ── Storage ───────────────────────────────────────────────────────────────────

function loadTasks() {
    const saved = localStorage.getItem('roboticsTasks');
    tasks = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));

    const savedMeetings = localStorage.getItem('roboticsMeetings');
    meetings = savedMeetings ? JSON.parse(savedMeetings) : [];

    // Migrate old fields
    tasks.forEach(task => {
        if (!task.logEntries) task.logEntries = [];
        if (!task.tags) task.tags = [];
        if (task.dueDate === undefined) task.dueDate = null;

        if (task.notes && task.notes.trim() !== '' && task.logEntries.length === 0) {
            task.logEntries.push({ id: Date.now(), date: new Date().toISOString(), text: task.notes });
            delete task.notes;
        }
    });

    if (saved) localStorage.setItem('roboticsTasks', JSON.stringify(tasks));
}

function saveTasks() {
    history.push(JSON.parse(JSON.stringify(tasks)));
    if (history.length > 20) history.shift();
    localStorage.setItem('roboticsTasks', JSON.stringify(tasks));
    updateProgress();
    updateUndoButton();
}

function updateUndoButton() {
    document.getElementById('undoBtn').disabled = history.length === 0;
}

function undo() {
    if (history.length > 0) {
        tasks = history.pop();
        localStorage.setItem('roboticsTasks', JSON.stringify(tasks));
        updateProgress();
        renderTasks();
        renderTagFilterRow();
        updateUndoButton();
        showToast('Action undone', 'success');
    }
}

// ── Render Tasks ──────────────────────────────────────────────────────────────

function renderTasks() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    Object.entries(phases).forEach(([key, config]) => {
        const section = document.createElement('section');
        section.className = 'phase-section';

        let phaseTasks = tasks.filter(t => t.phase === key);

        // Search filter
        if (searchQuery) {
            phaseTasks = phaseTasks.filter(t =>
                t.text.toLowerCase().includes(searchQuery) ||
                (t.tags || []).some(tag => tag.toLowerCase().includes(searchQuery))
            );
        }

        // Status filter
        if (activeFilter === 'active') phaseTasks = phaseTasks.filter(t => !t.completed);
        else if (activeFilter === 'completed') phaseTasks = phaseTasks.filter(t => t.completed);
        else if (activeFilter === 'overdue') phaseTasks = phaseTasks.filter(t => isOverdue(t));
        else if (activeFilter === 'high') phaseTasks = phaseTasks.filter(t => t.priority === 'high');

        // Tag filter
        if (activeTagFilter) {
            phaseTasks = phaseTasks.filter(t => (t.tags || []).includes(activeTagFilter));
        }

        const allPhaseTasks = tasks.filter(t => t.phase === key);
        const completedCount = allPhaseTasks.filter(t => t.completed).length;
        const totalCount = allPhaseTasks.length;
        const phasePercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

        section.innerHTML = `
            <div class="phase-header">
                <h2><i class="fas ${config.icon}"></i> ${config.title}</h2>
                <span class="phase-count">${completedCount}/${totalCount}</span>
            </div>
            <div class="phase-progress-bar-bg">
                <div class="phase-progress-bar" style="width: ${phasePercent}%"></div>
            </div>
        `;

        if (phaseTasks.length === 0) {
            section.innerHTML += `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>${searchQuery || activeFilter !== 'all' || activeTagFilter ? 'No tasks match filters' : 'No tasks yet'}</p>
                </div>
            `;
        } else {
            phaseTasks.sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                const priorityOrder = { high: 0, normal: 1, low: 2 };
                return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
            });

            phaseTasks.forEach(task => {
                const item = createTaskElement(task);
                section.appendChild(item);
            });
        }

        app.appendChild(section);
    });
}

function createTaskElement(task) {
    const item = document.createElement('div');
    const overdue = isOverdue(task);
    item.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 'normal'} ${overdue ? 'overdue' : ''}`;

    const priority = task.priority || 'normal';
    let priorityBadge = '';
    if (priority === 'high') {
        priorityBadge = `<span class="priority-badge high"><i class="fas fa-exclamation-circle"></i> HIGH</span>`;
    } else if (priority === 'low') {
        priorityBadge = `<span class="priority-badge low"><i class="fas fa-arrow-down"></i> LOW</span>`;
    }

    // Due date badge
    let dueBadge = '';
    if (task.dueDate) {
        const dateLabel = formatDueDate(task.dueDate);
        dueBadge = `<span class="due-badge ${overdue ? 'overdue' : ''}">
            <i class="fas fa-calendar-alt"></i> ${dateLabel}${overdue ? ' ⚠' : ''}
        </span>`;
    }

    // Tags
    let tagsHTML = '';
    if (task.tags && task.tags.length > 0) {
        tagsHTML = `<div class="task-tags">
            ${task.tags.map(tag => `<span class="task-tag" onclick="event.stopPropagation(); filterByTag('${tag}')">${tag}</span>`).join('')}
        </div>`;
    }

    const hasLogs = task.logEntries && task.logEntries.length > 0;
    const logsIcon = hasLogs
        ? `<i class="fas fa-history" style="color: var(--accent-yellow); margin-left: 5px; font-size:0.75rem;" title="${task.logEntries.length} log entries"></i>`
        : '';

    let logsHTML = buildLogsHTML(task);

    item.innerHTML = `
        <div class="task-content">
            <div class="task-main" onclick="toggleTask(${task.id})">
                <div class="task-checkbox">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-text-wrap">
                    <span class="task-text" id="task-text-${task.id}">${highlightSearch(task.text)}</span>
                    ${logsIcon}
                    ${dueBadge}
                    ${tagsHTML}
                </div>
            </div>
            ${logsHTML}
        </div>
        <div class="task-actions">
            ${priorityBadge}
            <button class="edit-task-btn" onclick="startEditTask(${task.id})" title="Edit task">
                <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    return item;
}

function buildLogsHTML(task) {
    const hasLogs = task.logEntries && task.logEntries.length > 0;

    let logsListHTML = '';
    if (hasLogs) {
        const sortedLogs = [...task.logEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
        logsListHTML = `
            <div class="task-logs" id="logs-${task.id}" style="display: none;">
                ${sortedLogs.map(log => {
                    const date = new Date(log.date);
                    const dateStr = date.toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });
                    const hoursTag = log.hours ? `<span class="log-hours-badge"><i class="fas fa-clock"></i> ${log.hours}h</span>` : '';
                    return `
                        <div class="log-entry">
                            <div class="log-header">
                                <span class="log-date"><i class="fas fa-calendar-alt"></i> ${dateStr} ${hoursTag}</span>
                                <button class="log-delete-btn" onclick="event.stopPropagation(); deleteLogEntry(${task.id}, ${log.id})" title="Delete entry">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            <div class="log-text">${log.text}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    return `
        ${logsListHTML}
        <div class="log-controls">
            ${hasLogs ? `
                <span class="task-logs-toggle" onclick="event.stopPropagation(); toggleLogs(${task.id})">
                    <span id="toggle-text-${task.id}">Show history (${task.logEntries.length})</span>
                </span>
            ` : ''}
            <button class="add-log-btn" onclick="event.stopPropagation(); showLogInput(${task.id})" title="Add log entry">
                <i class="fas fa-plus"></i> Add Entry
            </button>
        </div>
        <div class="log-input-container" id="log-input-${task.id}" style="display: none;">
            <textarea id="log-textarea-${task.id}" placeholder="What did you work on today?..." rows="3"></textarea>
            <div class="log-input-meta">
                <label class="log-hours-label"><i class="fas fa-clock"></i> Hours spent:
                    <input type="number" id="log-hours-${task.id}" min="0.1" max="24" step="0.25" placeholder="e.g. 1.5" class="log-hours-input">
                </label>
            </div>
            <div class="log-input-actions">
                <button class="log-save-btn" onclick="event.stopPropagation(); saveLogEntry(${task.id})">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="log-cancel-btn" onclick="event.stopPropagation(); hideLogInput(${task.id})">
                    Cancel
                </button>
            </div>
        </div>
    `;
}

function highlightSearch(text) {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// ── Task Actions ──────────────────────────────────────────────────────────────

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        showToast(task.completed ? 'Task completed! ✓' : 'Task reopened', 'success');
    }
};

window.deleteTask = function(id) {
    if (confirm("Delete this task?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        renderTagFilterRow();
        showToast('Task deleted', 'success');
    }
};

window.startEditTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const textEl = document.getElementById(`task-text-${id}`);
    if (!textEl) return;

    const original = task.text;

    // Build inline edit UI
    const container = textEl.closest('.task-text-wrap');
    if (!container) return;

    // Prevent double-editing
    if (container.querySelector('.inline-edit-input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-edit-input';
    input.value = original;

    const dueDateInput = document.createElement('input');
    dueDateInput.type = 'date';
    dueDateInput.className = 'inline-edit-date';
    dueDateInput.value = task.dueDate || '';

    const tagsInput = document.createElement('input');
    tagsInput.type = 'text';
    tagsInput.className = 'inline-edit-tags';
    tagsInput.placeholder = 'Tags (comma-separated)';
    tagsInput.value = (task.tags || []).join(', ');

    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'inline-edit-priority';
    ['high', 'normal', 'low'].forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p.toUpperCase();
        if (p === task.priority) opt.selected = true;
        prioritySelect.appendChild(opt);
    });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'inline-save-btn';
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.title = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'inline-cancel-btn';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.title = 'Cancel';

    const editRow = document.createElement('div');
    editRow.className = 'inline-edit-row';
    editRow.appendChild(input);
    editRow.appendChild(saveBtn);
    editRow.appendChild(cancelBtn);

    const editMeta = document.createElement('div');
    editMeta.className = 'inline-edit-meta';
    editMeta.innerHTML = '<label>Due: </label>';
    editMeta.appendChild(dueDateInput);
    editMeta.innerHTML += ' <label>Priority: </label>';
    editMeta.appendChild(prioritySelect);
    editMeta.innerHTML += ' <label>Tags: </label>';
    editMeta.appendChild(tagsInput);

    // Hide current content
    textEl.style.display = 'none';
    container.querySelectorAll('.due-badge, .task-tags').forEach(el => el.style.display = 'none');

    container.appendChild(editRow);
    container.appendChild(editMeta);
    input.focus();
    input.select();

    const save = () => {
        const newText = input.value.trim();
        if (!newText) { showToast('Task name cannot be empty', 'error'); return; }
        task.text = newText;
        task.dueDate = dueDateInput.value || null;
        task.priority = prioritySelect.value;
        task.tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
        saveTasks();
        renderTasks();
        renderTagFilterRow();
        showToast('Task updated', 'success');
    };

    const cancel = () => {
        editRow.remove();
        editMeta.remove();
        textEl.style.display = '';
        container.querySelectorAll('.due-badge, .task-tags').forEach(el => el.style.display = '');
    };

    saveBtn.addEventListener('click', e => { e.stopPropagation(); save(); });
    cancelBtn.addEventListener('click', e => { e.stopPropagation(); cancel(); });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.stopPropagation(); save(); }
        if (e.key === 'Escape') { e.stopPropagation(); cancel(); }
    });
};

window.filterByTag = function(tag) {
    activeTagFilter = tag;
    document.getElementById('clearTagFilter').style.display = 'inline-block';
    document.querySelectorAll('.tag-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.tag === tag);
    });
    renderTasks();
};

function renderTagFilterRow() {
    const allTags = getAllTags();
    const row = document.getElementById('tagFilterRow');
    const chips = document.getElementById('tagFilterChips');

    if (allTags.length === 0) {
        row.style.display = 'none';
        return;
    }

    row.style.display = 'flex';
    chips.innerHTML = allTags.map(tag =>
        `<span class="tag-chip ${activeTagFilter === tag ? 'active' : ''}" data-tag="${tag}" onclick="filterByTag('${tag}')">${tag}</span>`
    ).join('');
}

function addTask() {
    const input = document.getElementById('taskInput');
    const notesInput = document.getElementById('notesInput');
    const select = document.getElementById('phaseSelect');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const tagsInput = document.getElementById('tagsInput');

    const taskText = input.value.trim();
    if (!taskText) { showToast('Please enter a task', 'error'); return; }

    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);

    const newTask = {
        id: Date.now(),
        text: taskText,
        phase: select.value,
        priority: prioritySelect.value,
        logEntries: [],
        tags: tags,
        dueDate: dueDateInput.value || null,
        completed: false
    };

    const initialNote = notesInput.value.trim();
    if (initialNote) {
        newTask.logEntries.push({ id: Date.now() + 1, date: new Date().toISOString(), text: initialNote });
    }

    tasks.push(newTask);
    input.value = '';
    notesInput.value = '';
    prioritySelect.value = 'normal';
    dueDateInput.value = '';
    tagsInput.value = '';

    saveTasks();
    renderTasks();
    renderTagFilterRow();
    showToast('Task added!', 'success');
    input.focus();
}

// ── Log Entries ───────────────────────────────────────────────────────────────

window.toggleLogs = function(id) {
    const logsDiv = document.getElementById(`logs-${id}`);
    const toggleText = document.getElementById(`toggle-text-${id}`);
    const task = tasks.find(t => t.id === id);
    if (!logsDiv) return;
    if (logsDiv.style.display === 'none') {
        logsDiv.style.display = 'block';
        toggleText.textContent = `Hide history (${task.logEntries.length})`;
    } else {
        logsDiv.style.display = 'none';
        toggleText.textContent = `Show history (${task.logEntries.length})`;
    }
};

window.showLogInput = function(id) {
    const inputContainer = document.getElementById(`log-input-${id}`);
    const textarea = document.getElementById(`log-textarea-${id}`);
    if (inputContainer) { inputContainer.style.display = 'block'; textarea.focus(); }
};

window.hideLogInput = function(id) {
    const inputContainer = document.getElementById(`log-input-${id}`);
    const textarea = document.getElementById(`log-textarea-${id}`);
    const hoursInput = document.getElementById(`log-hours-${id}`);
    if (inputContainer) { inputContainer.style.display = 'none'; textarea.value = ''; if (hoursInput) hoursInput.value = ''; }
};

window.saveLogEntry = function(id) {
    const textarea = document.getElementById(`log-textarea-${id}`);
    const hoursInput = document.getElementById(`log-hours-${id}`);
    const text = textarea.value.trim();

    if (!text) { showToast('Please enter some text', 'error'); return; }

    const task = tasks.find(t => t.id === id);
    if (task) {
        if (!task.logEntries) task.logEntries = [];
        const entry = { id: Date.now(), date: new Date().toISOString(), text };
        const hours = hoursInput ? parseFloat(hoursInput.value) : NaN;
        if (!isNaN(hours) && hours > 0) entry.hours = hours;
        task.logEntries.push(entry);
        saveTasks();
        renderTasks();
        showToast('Log entry added!', 'success');
    }
};

window.deleteLogEntry = function(taskId, logId) {
    if (confirm('Delete this log entry?')) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.logEntries = task.logEntries.filter(log => log.id !== logId);
            saveTasks();
            renderTasks();
            showToast('Log entry deleted', 'success');
        }
    }
};

// ── Progress / Stats ──────────────────────────────────────────────────────────

function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => isOverdue(t)).length;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const totalLogs = tasks.reduce((acc, t) => acc + (t.logEntries ? t.logEntries.length : 0), 0);
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').innerText =
        `${percent}% SYSTEM OPTIMIZED (${done}/${total} OBJECTIVES COMPLETE)`;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statOverdue').textContent = overdue;
    document.getElementById('statHigh').textContent = high;
    document.getElementById('statLogs').textContent = totalLogs;
}

// ── Theme ─────────────────────────────────────────────────────────────────────

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'success');
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ── Export / Import ───────────────────────────────────────────────────────────

function exportData() {
    const exportObj = { tasks, meetings, exportDate: new Date().toISOString() };
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `robotics-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
}

function exportMarkdown() {
    const lines = [];
    lines.push('# Robotics Tracker Export');
    lines.push(`\n> Exported: ${new Date().toLocaleString()}`);
    lines.push('');

    Object.entries(phases).forEach(([key, config]) => {
        const phaseTasks = tasks.filter(t => t.phase === key);
        const done = phaseTasks.filter(t => t.completed).length;
        lines.push(`## ${config.title}`);
        lines.push(`Progress: ${done}/${phaseTasks.length}`);
        lines.push('');

        phaseTasks.forEach(task => {
            const checkbox = task.completed ? '[x]' : '[ ]';
            const priority = task.priority !== 'normal' ? ` *(${task.priority})*` : '';
            const due = task.dueDate ? ` 📅 ${formatDueDate(task.dueDate)}` : '';
            const tags = task.tags && task.tags.length > 0 ? ` 🏷 ${task.tags.join(', ')}` : '';
            lines.push(`- ${checkbox} **${task.text}**${priority}${due}${tags}`);

            if (task.logEntries && task.logEntries.length > 0) {
                const sorted = [...task.logEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
                sorted.forEach(log => {
                    const date = new Date(log.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    });
                    const hours = log.hours ? ` (${log.hours}h)` : '';
                    lines.push(`  - *${date}${hours}:* ${log.text}`);
                });
            }
        });
        lines.push('');
    });

    if (meetings.length > 0) {
        lines.push('## Meeting Minutes');
        lines.push('');
        const sorted = [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
        sorted.forEach(m => {
            const dateStr = new Date(m.date + ' ' + m.time).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
            lines.push(`### ${m.title}`);
            lines.push(`*${dateStr} at ${m.time}*`);
            if (m.tags && m.tags.length > 0) lines.push(`Tags: ${m.tags.join(', ')}`);
            if (m.notes) lines.push('');
            if (m.notes) lines.push(m.notes);
            lines.push('');
        });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `robotics-tracker-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Markdown exported!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            let importedTasks, importedMeetings;

            if (Array.isArray(imported)) {
                importedTasks = imported; importedMeetings = [];
            } else if (imported.tasks) {
                importedTasks = imported.tasks || []; importedMeetings = imported.meetings || [];
            } else {
                throw new Error('Invalid data format');
            }

            if (confirm('Import this data? Current tasks and meetings will be replaced.')) {
                tasks = importedTasks;
                meetings = importedMeetings;
                history = [];
                saveTasks();
                saveMeetings();
                renderTasks();
                renderMeetings();
                renderTagFilterRow();
                showToast('Data imported successfully!', 'success');
            }
        } catch (error) {
            showToast('Error importing data: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function resetToDefault() {
    if (confirm("⚠️ This will delete all custom tasks and meetings, and reset to defaults. Continue?")) {
        tasks = JSON.parse(JSON.stringify(defaultData));
        meetings = [];
        history = [];
        activeTagFilter = null;
        activeFilter = 'all';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
        saveTasks();
        saveMeetings();
        renderTasks();
        renderMeetings();
        renderTagFilterRow();
        showToast('System reset to defaults', 'success');
    }
}

// ── Meetings ──────────────────────────────────────────────────────────────────

function showMeetingForm() {
    const form = document.getElementById('meetingForm');
    form.style.display = 'block';
    document.getElementById('meetingTitle').focus();
    const now = new Date();
    document.getElementById('meetingDate').valueAsDate = now;
    document.getElementById('meetingTime').value = now.toTimeString().slice(0, 5);
}

function hideMeetingForm() {
    document.getElementById('meetingForm').style.display = 'none';
    document.getElementById('meetingTitle').value = '';
    document.getElementById('meetingNotes').value = '';
    document.getElementById('meetingTags').value = '';
}

function saveMeeting() {
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const notes = document.getElementById('meetingNotes').value.trim();
    const tagsRaw = document.getElementById('meetingTags').value;
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    if (!title) { showToast('Please enter a meeting title', 'error'); return; }
    if (!date) { showToast('Please select a date', 'error'); return; }

    meetings.push({
        id: Date.now(), title, date, time: time || '00:00',
        notes, tags, createdAt: new Date().toISOString()
    });

    saveMeetings();
    renderMeetings();
    hideMeetingForm();
    showToast('Meeting saved!', 'success');
}

function hideEditMeetingForm() {
    document.getElementById('meetingEditForm').style.display = 'none';
    editingMeetingId = null;
}

window.editMeeting = function(id) {
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;
    editingMeetingId = id;

    document.getElementById('editMeetingTitle').value = meeting.title;
    document.getElementById('editMeetingDate').value = meeting.date;
    document.getElementById('editMeetingTime').value = meeting.time;
    document.getElementById('editMeetingNotes').value = meeting.notes || '';
    document.getElementById('editMeetingTags').value = (meeting.tags || []).join(', ');

    const form = document.getElementById('meetingEditForm');
    form.style.display = 'block';
    document.getElementById('editMeetingTitle').focus();
};

function saveEditMeeting() {
    const title = document.getElementById('editMeetingTitle').value.trim();
    const date = document.getElementById('editMeetingDate').value;
    const time = document.getElementById('editMeetingTime').value;
    const notes = document.getElementById('editMeetingNotes').value.trim();
    const tagsRaw = document.getElementById('editMeetingTags').value;
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    if (!title) { showToast('Please enter a meeting title', 'error'); return; }

    const idx = meetings.findIndex(m => m.id === editingMeetingId);
    if (idx !== -1) {
        meetings[idx] = { ...meetings[idx], title, date, time: time || '00:00', notes, tags };
        saveMeetings();
        renderMeetings();
        hideEditMeetingForm();
        showToast('Meeting updated!', 'success');
    }
}

function saveMeetings() {
    localStorage.setItem('roboticsMeetings', JSON.stringify(meetings));
}

function renderMeetings(search = '') {
    const container = document.getElementById('meetingsList');
    let filtered = meetings;

    if (search) {
        filtered = meetings.filter(m =>
            m.title.toLowerCase().includes(search) ||
            (m.notes || '').toLowerCase().includes(search) ||
            (m.tags || []).some(t => t.toLowerCase().includes(search))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard"></i>
                <p>${search ? 'No meetings match your search' : 'No meetings recorded yet. Click "NEW MEETING" to add one.'}</p>
            </div>`;
        return;
    }

    const sorted = [...filtered].sort((a, b) => {
        return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
    });

    container.innerHTML = sorted.map(meeting => {
        const meetingDate = new Date(meeting.date + ' ' + (meeting.time || '00:00'));
        const dateStr = meetingDate.toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const timeStr = meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const tagsHTML = meeting.tags && meeting.tags.length > 0
            ? `<div class="meeting-tags">${meeting.tags.map(t => `<span class="task-tag">${t}</span>`).join('')}</div>`
            : '';

        return `
            <div class="meeting-card">
                <div class="meeting-header">
                    <div class="meeting-title-row">
                        <h3><i class="fas fa-calendar-check"></i> ${meeting.title}</h3>
                        <div class="meeting-card-actions">
                            <button class="edit-meeting-btn" onclick="editMeeting(${meeting.id})" title="Edit meeting">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="delete-meeting-btn" onclick="deleteMeeting(${meeting.id})" title="Delete meeting">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="meeting-datetime">
                        <span class="meeting-date"><i class="fas fa-calendar"></i> ${dateStr}</span>
                        <span class="meeting-time"><i class="fas fa-clock"></i> ${timeStr}</span>
                    </div>
                    ${tagsHTML}
                </div>
                ${meeting.notes ? `
                    <div class="meeting-notes">
                        ${meeting.notes.split('\n').map(line => line ? `<p>${line}</p>` : '').join('')}
                    </div>` : ''}
            </div>`;
    }).join('');
}

window.deleteMeeting = function(id) {
    if (confirm('Delete this meeting record?')) {
        meetings = meetings.filter(m => m.id !== id);
        saveMeetings();
        renderMeetings(document.getElementById('meetingSearchInput').value.toLowerCase());
        showToast('Meeting deleted', 'success');
    }
};

// ── Toast ─────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
