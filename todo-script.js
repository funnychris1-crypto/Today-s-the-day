// To-Do List App with Local Storage
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        // DOM Elements
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.taskCount = document.getElementById('taskCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        
        this.init();
    }

    // Initialize App
    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    }

    // Setup Event Listeners
    setupEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.deleteAllBtn.addEventListener('click', () => this.deleteAll());
    }

    // Add Task
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            alert('Please enter a task');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.render();
    }

    // Toggle Task Completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Delete Task
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    // Edit Task
    editTask(id) {
        this.editingId = id;
        this.render();
        
        const editInput = document.querySelector(`[data-edit-input="${id}"]`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }

    // Save Edited Task
    saveEditedTask(id, newText) {
        const trimmedText = newText.trim();
        if (!trimmedText) {
            alert('Task cannot be empty');
            return;
        }

        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.text = trimmedText;
            this.saveTasks();
            this.editingId = null;
            this.render();
        }
    }

    // Cancel Edit
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // Change Priority
    changePriority(id, priority) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.priority = priority;
            this.saveTasks();
            this.render();
        }
    }

    // Set Filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    // Get Filtered Tasks
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    // Clear Completed Tasks
    clearCompleted() {
        if (confirm('Are you sure you want to delete all completed tasks?')) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    // Delete All Tasks
    deleteAll() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    // Update Task Count
    updateTaskCount() {
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const total = this.tasks.length;
        
        if (total === 0) {
            this.taskCount.textContent = '0 tasks';
        } else {
            this.taskCount.textContent = `${activeTasks} of ${total} tasks`;
        }
    }

    // Render Tasks
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update empty state
        if (this.tasks.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.taskList.innerHTML = '';
        } else {
            this.emptyState.classList.add('hidden');
            this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
            this.attachTaskEventListeners();
        }

        this.updateTaskCount();
    }

    // Create Task HTML
    createTaskHTML(task) {
        if (this.editingId === task.id) {
            return `
                <li class="task-item edit-mode" data-task-id="${task.id}">
                    <input 
                        type="text" 
                        class="edit-input" 
                        data-edit-input="${task.id}"
                        value="${this.escapeHtml(task.text)}"
                    >
                    <div class="task-actions">
                        <button class="task-btn save-btn" onclick="app.saveEditedTask(${task.id}, document.querySelector('[data-edit-input=\\\"${task.id}\\\"]').value)">Save</button>
                        <button class="task-btn cancel-btn" onclick="app.cancelEdit()">Cancel</button>
                    </div>
                </li>
            `;
        }

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="app.toggleTask(${task.id})"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="app.editTask(${task.id})">Edit</button>
                    <button class="task-btn delete-btn" onclick="app.deleteTask(${task.id})">Delete</button>
                </div>
            </li>
        `;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Attach Event Listeners to Task Items
    attachTaskEventListeners() {
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            const input = item.querySelector('.edit-input');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const id = parseInt(item.dataset.taskId);
                        this.saveEditedTask(id, input.value);
                    }
                });
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Escape') {
                        this.cancelEdit();
                    }
                });
            }
        });
    }

    // Save Tasks to Local Storage
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Load Tasks from Local Storage
    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        this.tasks = saved ? JSON.parse(saved) : [];
    }
}

// Initialize App
const app = new TodoApp();
