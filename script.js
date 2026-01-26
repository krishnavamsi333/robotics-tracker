// 1. The Default Data (Your Roadmap)
const defaultData = [
    // Phase 1
    { id: 1, text: "Python: Basics & OOP", phase: "phase1", completed: false },
    { id: 2, text: "Python: Multithreading basics", phase: "phase1", completed: false },
    { id: 3, text: "C++: Pointers & Memory Management", phase: "phase1", completed: false },
    { id: 4, text: "C++: OOP Concepts", phase: "phase1", completed: false },
    { id: 5, text: "Linux: Ubuntu Command Line & Shell", phase: "phase1", completed: false },
    { id: 6, text: "Git: Clone, Commit, Push, Branch", phase: "phase1", completed: false },
    
    // Phase 2
    { id: 7, text: "ROS 2: Node Lifecycle & Launch Files", phase: "phase2", completed: false },
    { id: 8, text: "ROS 2: Topics, Services, Actions", phase: "phase2", completed: false },
    { id: 9, text: "ROS 2: RViz & Gazebo Simulation", phase: "phase2", completed: false },
    { id: 10, text: "Sim Project: Differential Drive Robot", phase: "phase2", completed: false },
    { id: 11, text: "Theory: Coordinate Frames (tf2)", phase: "phase2", completed: false },

    // Phase 3
    { id: 12, text: "Microcontroller: Bare Metal + HAL", phase: "phase3", completed: false },
    { id: 13, text: "Comms: UART, I2C, SPI, CAN", phase: "phase3", completed: false },
    { id: 14, text: "Motor Control: Encoder + PID", phase: "phase3", completed: false },
    { id: 15, text: "Embedded Project: ROS 2 Node on Hardware", phase: "phase3", completed: false },

    // Phase 4
    { id: 16, text: "Advanced: Nav2 (Autonomous Navigation)", phase: "phase4", completed: false },
    { id: 17, text: "Advanced: Sensor Fusion (IMU + Encoder)", phase: "phase4", completed: false },
    { id: 18, text: "Final Project 1: Mapping Robot", phase: "phase4", completed: false },
    { id: 19, text: "Final Project 2: Autonomous Obstacle Avoidance", phase: "phase4", completed: false },
    { id: 20, text: "Portfolio: Publish all code to GitHub", phase: "phase4", completed: false }
];

let tasks = [];

// 2. Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateProgress();

    // Event Listeners
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('resetBtn').addEventListener('click', resetToDefault);
});

// 3. Load Data from LocalStorage
function loadTasks() {
    const saved = localStorage.getItem('roboticsTasks');
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        tasks = JSON.parse(JSON.stringify(defaultData)); // Deep copy
    }
}

// 4. Save Data
function saveTasks() {
    localStorage.setItem('roboticsTasks', JSON.stringify(tasks));
    updateProgress();
}

// 5. Render the UI
function renderTasks() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const phases = {
        phase1: "Phase 1: Foundations (Months 1-3)",
        phase2: "Phase 2: ROS 2 & Core Robotics (Months 4-6)",
        phase3: "Phase 3: Embedded Integration (Months 7-9)",
        phase4: "Phase 4: Advanced & Job Ready (Months 10-12)"
    };

    for (const [key, title] of Object.entries(phases)) {
        // Filter tasks for this phase
        const phaseTasks = tasks.filter(t => t.phase === key);
        
        // Create Section
        const section = document.createElement('section');
        section.className = 'phase-section';
        section.innerHTML = `<h2>${title}</h2>`;
        
        const list = document.createElement('div');
        
        phaseTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = `task-item ${task.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="task-left" onclick="toggleTask(${task.id})">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            list.appendChild(item);
        });

        section.appendChild(list);
        app.appendChild(section);
    }
}

// 6. Actions
window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
};

window.deleteTask = function(id) {
    if(confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
};

window.addTask = function() {
    const input = document.getElementById('taskInput');
    const select = document.getElementById('phaseSelect');
    const text = input.value.trim();
    
    if (text) {
        const newTask = {
            id: Date.now(), // Use timestamp as unique ID
            text: text,
            phase: select.value,
            completed: false
        };
        tasks.push(newTask);
        input.value = '';
        saveTasks();
        renderTasks();
    } else {
        alert("Please enter a task name!");
    }
};

window.resetToDefault = function() {
    if(confirm("This will delete all custom tasks and progress. Are you sure?")) {
        tasks = JSON.parse(JSON.stringify(defaultData));
        saveTasks();
        renderTasks();
    }
};

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').innerText = `${percent}% Completed (${completed}/${total} Tasks)`;
}
