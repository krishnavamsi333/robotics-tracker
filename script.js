const defaultData = [
    { id: 1, text: "Python: Basics & OOP", phase: "phase1", completed: false },
    { id: 2, text: "C++: Pointers & Memory", phase: "phase1", completed: false },
    { id: 7, text: "ROS 2: Topics & Services", phase: "phase2", completed: false },
    { id: 12, text: "UART, I2C, SPI, CAN", phase: "phase3", completed: false },
    { id: 16, text: "Nav2: Autonomous Pathing", phase: "phase4", completed: false }
];

let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateProgress();

    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('resetBtn').addEventListener('click', resetToDefault);
});

function loadTasks() {
    const saved = localStorage.getItem('roboticsTasks');
    tasks = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));
}

function saveTasks() {
    localStorage.setItem('roboticsTasks', JSON.stringify(tasks));
    updateProgress();
}

function renderTasks() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const phases = {
        phase1: "PHASE I: FOUNDATIONS",
        phase2: "PHASE II: ROS 2 CORE",
        phase3: "PHASE III: HARDWARE",
        phase4: "PHASE IV: ADVANCED"
    };

    Object.entries(phases).forEach(([key, title]) => {
        const section = document.createElement('section');
        section.className = 'phase-section';
        section.innerHTML = `<h2>${title}</h2>`;
        
        const phaseTasks = tasks.filter(t => t.phase === key);
        phaseTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = `task-item ${task.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <div style="cursor:pointer" onclick="toggleTask(${task.id})">
                    <span class="task-text">${task.text}</span>
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
            `;
            section.appendChild(item);
        });
        app.appendChild(section);
    });
}

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
};

window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
};

function addTask() {
    const input = document.getElementById('taskInput');
    const select = document.getElementById('phaseSelect');
    if (input.value.trim()) {
        tasks.push({
            id: Date.now(),
            text: input.value.trim(),
            phase: select.value,
            completed: false
        });
        input.value = '';
        saveTasks();
        renderTasks();
    }
}

function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').innerText = `${percent}% SYSTEM OPTIMIZED (${done}/${total})`;
}

function resetToDefault() {
    if(confirm("Wipe all custom data?")) {
        tasks = JSON.parse(JSON.stringify(defaultData));
        saveTasks();
        renderTasks();
    }
}