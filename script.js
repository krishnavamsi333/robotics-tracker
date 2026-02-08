const defaultData = [
    { id: 1, text: "Python: Basics & OOP", phase: "phase1", completed: false, priority: "high" },
    { id: 2, text: "C++: Pointers & Memory", phase: "phase1", completed: false, priority: "high" },
    { id: 3, text: "Linux: CLI & Shell Scripting", phase: "phase1", completed: false, priority: "normal" },
    { id: 4, text: "Git: Version Control", phase: "phase1", completed: false, priority: "normal" },
    { id: 5, text: "Data Structures & Algorithms", phase: "phase1", completed: false, priority: "high" },
    { id: 6, text: "Math: Linear Algebra & Calculus", phase: "phase1", completed: false, priority: "normal" },
    
    { id: 7, text: "ROS 2: Topics & Services", phase: "phase2", completed: false, priority: "high" },
    { id: 8, text: "ROS 2: Actions & Parameters", phase: "phase2", completed: false, priority: "normal" },
    { id: 9, text: "URDF & Robot Modeling", phase: "phase2", completed: false, priority: "normal" },
    { id: 10, text: "Gazebo Simulation", phase: "phase2", completed: false, priority: "normal" },
    { id: 11, text: "TF2: Coordinate Transforms", phase: "phase2", completed: false, priority: "high" },
    
    { id: 12, text: "UART, I2C, SPI, CAN", phase: "phase3", completed: false, priority: "high" },
    { id: 13, text: "Microcontroller Programming", phase: "phase3", completed: false, priority: "high" },
    { id: 14, text: "Sensor Integration", phase: "phase3", completed: false, priority: "normal" },
    { id: 15, text: "Motor Control & PWM", phase: "phase3", completed: false, priority: "normal" },
    
    { id: 16, text: "Nav2: Autonomous Pathing", phase: "phase4", completed: false, priority: "high" },
    { id: 17, text: "Computer Vision: OpenCV", phase: "phase4", completed: false, priority: "high" },
    { id: 18, text: "SLAM: Mapping & Localization", phase: "phase4", completed: false, priority: "high" },
    { id: 19, text: "Machine Learning Basics", phase: "phase4", completed: false, priority: "normal" },
    { id: 20, text: "ROS 2 Control Framework", phase: "phase4", completed: false, priority: "normal" }
];

let tasks = [];
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
    updateProgress();
    setupEventListeners();
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
                
                const priorityBadge = task.priority && task.priority !== 'normal' 
                    ? `<span class="priority-badge ${task.priority}">${task.priority}</span>` 
                    : '';

                item.innerHTML = `
                    <div class="task-content" onclick="toggleTask(${task.id})">
                        <div class="task-checkbox">
                            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                        <span class="task-text">${highlightSearch(task.text)}</span>
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
    const select = document.getElementById('phaseSelect');
    const prioritySelect = document.getElementById('prioritySelect');
    
    const taskText = input.value.trim();
    
    if (!taskText) {
        showToast('Please enter a task', 'error');
        return;
    }
    
    tasks.push({
        id: Date.now(),
        text: taskText,
        phase: select.value,
        priority: prioritySelect.value,
        completed: false
    });
    
    input.value = '';
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
    if(confirm("⚠️ This will delete all custom tasks and reset to defaults. Continue?")) {
        tasks = JSON.parse(JSON.stringify(defaultData));
        history = [];
        saveTasks();
        renderTasks();
        showToast('System reset to defaults', 'success');
    }
}

function exportData() {
    const dataStr = JSON.stringify(tasks, null, 2);
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
            
            // Validate data structure
            if (!Array.isArray(imported)) {
                throw new Error('Invalid data format');
            }

            if (confirm('Import this data? Current tasks will be replaced.')) {
                tasks = imported;
                history = [];
                saveTasks();
                renderTasks();
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