let tasks = JSON.parse(localStorage.getItem("tasks")) || [
  {
    title: 'Finish Assignment',
    description: 'Complete the To-Do dashboard assignment',
    priority: 'high',
    dueDate: '2026-03-05',
    completed: false,
  },
  {
    title: 'Buy Groceries',
    description: 'Milk, Eggs, Bread, and Fruits',
    priority: 'medium',
    dueDate: '2026-03-03',
    completed: false,
  },
  {
    title: 'Eat Lunch',
    description: 'Rice, Fish, Steak',
    priority: 'low',
    dueDate: '2026-03-03',
    completed: false,
  },
];

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

const taskList = document.getElementById('taskList');
const todoForm = document.getElementById('todoForm');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const dueDateInput = document.getElementById('dueDate');

const totalTasksNum = document.querySelector('#totalTasks .stats-num');
const completedTasksNum = document.querySelector('#completedTasks .stats-num');
const pendingTasksNum = document.querySelector('#pendingTasks .stats-num');
const highPriorityNum = document.querySelector('#highPriorityTasks .stats-num');

const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((task) => task.priority === 'high').length;

  totalTasksNum.textContent = total;
  completedTasksNum.textContent = completed;
  pendingTasksNum.textContent = pending;
  highPriorityNum.textContent = highPriority;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}%`;
}

let draggedIndex = null;
let isDragging = false;

function renderTasks() {
  taskList.innerHTML = '';

  if (!isDragging) {
    tasks.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-card';

    li.dataset.index = index;
    li.setAttribute('draggable', 'true');

    if (task.completed) {
      li.classList.add('completed');
    }
    li.innerHTML = `
      <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} data-index="${index}" />
      <div class="task-content">
        <h2 class="card-title">${task.title}</h2>
        <p class="card-desc">${task.description}</p>
        <div class="card-level">
          <span class="priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
          <span class="date">${task.dueDate}</span>
        </div>
      </div>
      <div class="card-actions">
      <button class="edit-btn" data-index="${index}">✏️</button>
      <button class="delete-btn" data-index="${index}">🗑</button>
      </div>
      
    `;

    li.addEventListener('dragstart', () => {
      draggedIndex = index;
      isDragging = true;
      li.classList.add('dragging');
    });
    li.addEventListener('dragend', () => {
      draggedIndex = null;
      isDragging = false;
      li.classList.remove('dragging');
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      li.classList.add('over');
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove('over');
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('over');
      const targetIndex = Number(li.dataset.index);

      if (draggedIndex === targetIndex) {
        return;
      }
      const movedTask = tasks.splice(draggedIndex, 1)[0];
      tasks.splice(targetIndex, 0, movedTask);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateStats();
  updateProgress();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newTask = {
    title: titleInput.value,
    description: descInput.value,
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  todoForm.reset();

  renderTasks();
});

taskList.addEventListener('click', (e) => {
  if (!e.target.classList.contains('edit-btn')) return;

  const { index } = e.target.dataset;
  const task = tasks[index];
  const card = e.target.closest('.task-card');

  card.innerHTML = `
    <div class="edit-form">
      <input type="text" class="edit-title" value="${task.title}" />
      <textarea class="edit-desc">${task.description}</textarea>

      <select class="edit-priority">
        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
      </select>

      <input type="date" class="edit-date" value="${task.dueDate}" />

      <button class="save-btn">💾 Save</button>
      <button class="cancel-btn">❌ Cancel</button>
    </div>
  `;

  card.querySelector('.save-btn').addEventListener('click', () => {
    task.title = card.querySelector('.edit-title').value;
    task.description = card.querySelector('.edit-desc').value;
    task.priority = card.querySelector('.edit-priority').value;
    task.dueDate = card.querySelector('.edit-date').value;
    saveTasks();
    renderTasks();
  });

  card.querySelector('.cancel-btn').addEventListener('click', renderTasks);
});

taskList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const { index } = e.target.dataset;
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
});

taskList.addEventListener('change', (e) => {
  if (e.target.classList.contains('task-check')) {
    const { index } = e.target.dataset;
    tasks[index].completed = e.target.checked;
    saveTasks();
    renderTasks();

    updateStats();
    updateProgress();
  }
});

renderTasks();
