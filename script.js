const defaultData = [
    { id: 1, text: "Python: Basics & OOP", phase: "phase1", completed: false, priority: "high", logEntries: [] },
    { id: 2, text: "C++: Pointers & Memory", phase: "phase1", completed: false, priority: "high", logEntries: [] },
    { id: 3, text: "Linux: CLI & Shell Scripting", phase: "phase1", completed: false, priority: "normal", logEntries: [] },
    { id: 4, text: "Git: Version Control", phase: "phase1", completed: false, priority: "normal", logEntries: [] },
    { id: 5, text: "Data Structures & Algorithms", phase: "phase1", completed: false, priority: "high", logEntries: [] },
    { id: 6, text: "Math: Linear Algebra & Calculus", phase: "phase1", completed: false, priority: "normal", logEntries: [] },
    
    { id: 7, text: "ROS 2: Topics & Services", phase: "phase2", completed: false, priority: "high", logEntries: [] },
    { id: 8, text: "ROS 2: Actions & Parameters", phase: "phase2", completed: false, priority: "normal", logEntries: [] },
    { id: 9, text: "URDF & Robot Modeling", phase: "phase2", completed: false, priority: "normal", logEntries: [] },
    { id: 10, text: "Gazebo Simulation", phase: "phase2", completed: false, priority: "normal", logEntries: [] },
    { id: 11, text: "TF2: Coordinate Transforms", phase: "phase2", completed: false, priority: "high", logEntries: [] },
    
    { id: 12, text: "UART, I2C, SPI, CAN", phase: "phase3", completed: false, priority: "high", logEntries: [] },
    { id: 13, text: "Microcontroller Programming", phase: "phase3", completed: false, priority: "high", logEntries: [] },
    { id: 14, text: "Sensor Integration", phase: "phase3", completed: false, priority: "normal", logEntries: [] },
    { id: 15, text: "Motor Control & PWM", phase: "phase3", completed: false, priority: "normal", logEntries: [] },
    
    { id: 16, text: "Nav2: Autonomous Pathing", phase: "phase4", completed: false, priority: "high", logEntries: [] },
    { id: 17, text: "Computer Vision: OpenCV", phase: "phase4", completed: false, priority: "high", logEntries: [] },
    { id: 18, text: "SLAM: Mapping & Localization", phase: "phase4", completed: false, priority: "high", logEntries: [] },
    { id: 19, text: "Machine Learning Basics", phase: "phase4", completed: false, priority: "normal", logEntries: [] },
    { id: 20, text: "ROS 2 Control Framework", phase: "phase4", completed: false, priority: "normal", logEntries: [] }
];

let tasks = [];
let meetings = [];
let history = [];
let searchQuery = '';

// Phase configurations
const phases = {
    phase1: { title: "PHASE I: FOUNDATIONS", icon: "fa-cube" },
    phase2: { title: "PHASE II: ROS 2 CORE", icon: "fa-robot" },
    phase3: { title: "PHASE III: HARDWARE", icon: "fa-microchip" },
    phase4: { title: "PHASE IV: ADVANCED", icon: "fa-rocket" }
};

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    renderTasks();
    renderMeetings();
    updateProgress();
    setupEventListeners();
    
    // Set default date and time for meeting form
    const now = new Date();
    document.getElementById('meetingDate').valueAsDate = now;
    document.getElementById('meetingTime').value = now.toTimeString().slice(0, 5);
});

function setupEventListeners() {
    // Add task
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });

    document.getElementById('clearSearchBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        searchQuery = '';
        renderTasks();
    });

    // Settings
    document.getElementById('resetBtn').addEventListener('click', resetToDefault);
    document.getElementById('undoBtn').addEventListener('click', undo);

    // Import/Export
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', importData);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Meeting buttons
    document.getElementById('addMeetingBtn').addEventListener('click', showMeetingForm);
    document.getElementById('saveMeetingBtn').addEventListener('click', saveMeeting);
    document.getElementById('cancelMeetingBtn').addEventListener('click', hideMeetingForm);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
    });
}

function loadTasks() {
    const saved = localStorage.getItem('roboticsTasks');
    tasks = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));
    
    // Load meetings
    const savedMeetings = localStorage.getItem('roboticsMeetings');
    meetings = savedMeetings ? JSON.parse(savedMeetings) : [];
    
    // Migrate old 'notes' field to 'logEntries' if needed
    tasks.forEach(task => {
        if (!task.logEntries) {
            task.logEntries = [];
        }
        // Migrate old notes to first log entry if exists
        if (task.notes && task.notes.trim() !== '' && task.logEntries.length === 0) {
            task.logEntries.push({
                id: Date.now(),
                date: new Date().toISOString(),
                text: task.notes
            });
            delete task.notes;
        }
    });
    
    // Save migrated data
    if (saved) {
        localStorage.setItem('roboticsTasks', JSON.stringify(tasks));
    }
}

function saveTasks() {
    // Save to history for undo
    history.push(JSON.parse(JSON.stringify(tasks)));
    if (history.length > 20) history.shift(); // Keep last 20 states
    
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
        updateUndoButton();
        showToast('Action undone', 'success');
    }
}

function renderTasks() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    Object.entries(phases).forEach(([key, config]) => {
        const section = document.createElement('section');
        section.className = 'phase-section';
        
        // Filter tasks by phase and search query
        let phaseTasks = tasks.filter(t => t.phase === key);
        
        if (searchQuery) {
            phaseTasks = phaseTasks.filter(t => 
                t.text.toLowerCase().includes(searchQuery)
            );
        }

        const completedCount = phaseTasks.filter(t => t.completed).length;
        const totalCount = phaseTasks.length;

        section.innerHTML = `
            <div class="phase-header">
                <h2><i class="fas ${config.icon}"></i> ${config.title}</h2>
                <span class="phase-count">${completedCount}/${totalCount}</span>
            </div>
        `;
        
        if (phaseTasks.length === 0) {
            section.innerHTML += `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>${searchQuery ? 'No tasks match your search' : 'No tasks yet'}</p>
                </div>
            `;
        } else {
            // Sort by priority: high > normal > low, then by completion status
            phaseTasks.sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                const priorityOrder = { high: 0, normal: 1, low: 2 };
                return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
            });

            phaseTasks.forEach(task => {
                const item = document.createElement('div');
                item.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 'normal'}`;
                
                const priority = task.priority || 'normal';
                let priorityBadge = '';
                
                // Only show badges for HIGH and LOW priority
                if (priority === 'high') {
                    priorityBadge = `<span class="priority-badge high"><i class="fas fa-exclamation-circle"></i> HIGH</span>`;
                } else if (priority === 'low') {
                    priorityBadge = `<span class="priority-badge low"><i class="fas fa-arrow-down"></i> LOW</span>`;
                }

                const hasLogs = task.logEntries && task.logEntries.length > 0;
                const logsIcon = hasLogs ? `<i class="fas fa-history" style="color: var(--accent-yellow); margin-left: 5px;" title="${task.logEntries.length} log entries"></i>` : '';

                // Build log entries HTML
                let logsHTML = '';
                if (hasLogs) {
                    const sortedLogs = [...task.logEntries].sort((a, b) => 
                        new Date(b.date) - new Date(a.date)
                    );
                    
                    logsHTML = `
                        <div class="task-logs" id="logs-${task.id}" style="display: none;">
                            ${sortedLogs.map(log => {
                                const date = new Date(log.date);
                                const dateStr = date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                return `
                                    <div class="log-entry">
                                        <div class="log-header">
                                            <span class="log-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
                                            <button class="log-delete-btn" onclick="event.stopPropagation(); deleteLogEntry(${task.id}, ${log.id})" title="Delete entry">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                        <div class="log-text">${log.text}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="log-controls">
                            <span class="task-logs-toggle" onclick="event.stopPropagation(); toggleLogs(${task.id})">
                                <span id="toggle-text-${task.id}">Show history (${task.logEntries.length})</span>
                            </span>
                            <button class="add-log-btn" onclick="event.stopPropagation(); showLogInput(${task.id})" title="Add new log entry">
                                <i class="fas fa-plus"></i> Add Entry
                            </button>
                        </div>
                        <div class="log-input-container" id="log-input-${task.id}" style="display: none;">
                            <textarea id="log-textarea-${task.id}" placeholder="What did you work on today?..." rows="3"></textarea>
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
                } else {
                    logsHTML = `
                        <div class="log-controls">
                            <button class="add-log-btn" onclick="event.stopPropagation(); showLogInput(${task.id})" title="Add first log entry">
                                <i class="fas fa-plus"></i> Add Entry
                            </button>
                        </div>
                        <div class="log-input-container" id="log-input-${task.id}" style="display: none;">
                            <textarea id="log-textarea-${task.id}" placeholder="What did you work on today?..." rows="3"></textarea>
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

                item.innerHTML = `
                    <div class="task-content" onclick="toggleTask(${task.id})">
                        <div class="task-main">
                            <div class="task-checkbox">
                                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                            </div>
                            <span class="task-text">${highlightSearch(task.text)} ${logsIcon}</span>
                        </div>
                        ${logsHTML}
                    </div>
                    <div class="task-actions">
                        ${priorityBadge}
                        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                section.appendChild(item);
            });
        }
        
        app.appendChild(section);
    });
}

function highlightSearch(text) {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-yellow); color: #000;">$1</mark>');
}

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        showToast(task.completed ? 'Task completed!' : 'Task reopened', 'success');
    }
};

window.toggleLogs = function(id) {
    const logsDiv = document.getElementById(`logs-${id}`);
    const toggleText = document.getElementById(`toggle-text-${id}`);
    const task = tasks.find(t => t.id === id);
    
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
    inputContainer.style.display = 'block';
    textarea.focus();
};

window.hideLogInput = function(id) {
    const inputContainer = document.getElementById(`log-input-${id}`);
    const textarea = document.getElementById(`log-textarea-${id}`);
    inputContainer.style.display = 'none';
    textarea.value = '';
};

window.saveLogEntry = function(id) {
    const textarea = document.getElementById(`log-textarea-${id}`);
    const text = textarea.value.trim();
    
    if (!text) {
        showToast('Please enter some text', 'error');
        return;
    }
    
    const task = tasks.find(t => t.id === id);
    if (task) {
        if (!task.logEntries) {
            task.logEntries = [];
        }
        
        task.logEntries.push({
            id: Date.now(),
            date: new Date().toISOString(),
            text: text
        });
        
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

window.deleteTask = function(id) {
    if (confirm("Delete this task?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        showToast('Task deleted', 'success');
    }
};

function addTask() {
    const input = document.getElementById('taskInput');
    const notesInput = document.getElementById('notesInput');
    const select = document.getElementById('phaseSelect');
    const prioritySelect = document.getElementById('prioritySelect');
    
    const taskText = input.value.trim();
    
    if (!taskText) {
        showToast('Please enter a task', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        phase: select.value,
        priority: prioritySelect.value,
        logEntries: [],
        completed: false
    };
    
    // If there's an initial note, add it as first log entry
    const initialNote = notesInput.value.trim();
    if (initialNote) {
        newTask.logEntries.push({
            id: Date.now(),
            date: new Date().toISOString(),
            text: initialNote
        });
    }
    
    tasks.push(newTask);
    
    input.value = '';
    notesInput.value = '';
    prioritySelect.value = 'normal';
    saveTasks();
    renderTasks();
    showToast('Task added!', 'success');
    input.focus();
}

function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').innerText = 
        `${percent}% SYSTEM OPTIMIZED (${done}/${total} OBJECTIVES COMPLETE)`;
}

function resetToDefault() {
    if(confirm("⚠️ This will delete all custom tasks and meetings, and reset to defaults. Continue?")) {
        tasks = JSON.parse(JSON.stringify(defaultData));
        meetings = [];
        history = [];
        saveTasks();
        saveMeetings();
        renderTasks();
        renderMeetings();
        showToast('System reset to defaults', 'success');
    }
}

function exportData() {
    const exportObj = {
        tasks: tasks,
        meetings: meetings,
        exportDate: new Date().toISOString()
    };
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

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Handle both old format (array) and new format (object with tasks & meetings)
            let importedTasks, importedMeetings;
            
            if (Array.isArray(imported)) {
                // Old format - just tasks
                importedTasks = imported;
                importedMeetings = [];
            } else if (imported.tasks) {
                // New format - tasks and meetings
                importedTasks = imported.tasks || [];
                importedMeetings = imported.meetings || [];
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
                showToast('Data imported successfully!', 'success');
            }
        } catch (error) {
            showToast('Error importing data: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

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

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== MEETING MINUTES FUNCTIONS ==========

function showMeetingForm() {
    const form = document.getElementById('meetingForm');
    form.style.display = 'block';
    document.getElementById('meetingTitle').focus();
    
    // Set current date and time
    const now = new Date();
    document.getElementById('meetingDate').valueAsDate = now;
    document.getElementById('meetingTime').value = now.toTimeString().slice(0, 5);
}

function hideMeetingForm() {
    const form = document.getElementById('meetingForm');
    form.style.display = 'none';
    
    // Clear form
    document.getElementById('meetingTitle').value = '';
    document.getElementById('meetingNotes').value = '';
}

function saveMeeting() {
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const notes = document.getElementById('meetingNotes').value.trim();
    
    if (!title) {
        showToast('Please enter a meeting title', 'error');
        return;
    }
    
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }
    
    const meeting = {
        id: Date.now(),
        title: title,
        date: date,
        time: time || '00:00',
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    meetings.push(meeting);
    saveMeetings();
    renderMeetings();
    hideMeetingForm();
    showToast('Meeting saved!', 'success');
}

function saveMeetings() {
    localStorage.setItem('roboticsMeetings', JSON.stringify(meetings));
}

function renderMeetings() {
    const container = document.getElementById('meetingsList');
    
    if (meetings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard"></i>
                <p>No meetings recorded yet. Click "NEW MEETING" to add one.</p>
            </div>
        `;
        return;
    }
    
    // Sort meetings by date (newest first)
    const sortedMeetings = [...meetings].sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });
    
    container.innerHTML = sortedMeetings.map(meeting => {
        const meetingDate = new Date(meeting.date + ' ' + meeting.time);
        const dateStr = meetingDate.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const timeStr = meetingDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="meeting-card">
                <div class="meeting-header">
                    <div class="meeting-title-row">
                        <h3><i class="fas fa-calendar-check"></i> ${meeting.title}</h3>
                        <button class="delete-meeting-btn" onclick="deleteMeeting(${meeting.id})" title="Delete meeting">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="meeting-datetime">
                        <span class="meeting-date"><i class="fas fa-calendar"></i> ${dateStr}</span>
                        <span class="meeting-time"><i class="fas fa-clock"></i> ${timeStr}</span>
                    </div>
                </div>
                ${meeting.notes ? `
                    <div class="meeting-notes">
                        ${meeting.notes.split('\n').map(line => `<p>${line}</p>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

window.deleteMeeting = function(id) {
    if (confirm('Delete this meeting record?')) {
        meetings = meetings.filter(m => m.id !== id);
        saveMeetings();
        renderMeetings();
        showToast('Meeting deleted', 'success');
    }
};