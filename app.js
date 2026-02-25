const STORAGE_KEY = "todo-app-tasks-v1";
const PRIORITY_VALUES = ["high", "medium", "low"];

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const priorityInput = document.getElementById("todo-priority");
const list = document.getElementById("todo-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearDoneButton = document.getElementById("clear-done");

let tasks = loadTasks();
let activeStatusFilter = "all";
let activePriorityFilter = "all";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((task) => task && typeof task.text === "string")
      .map((task) => ({
        id: task.id || crypto.randomUUID(),
        text: task.text,
        done: Boolean(task.done),
        priority: PRIORITY_VALUES.includes(task.priority) ? task.priority : "medium",
      }));
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text, priority) {
  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
    priority,
  });

  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );

  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function clearDoneTasks() {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  render();
}

function getFilteredTasks() {
  return tasks.filter((task) => {
    const statusMatch =
      activeStatusFilter === "all" ||
      (activeStatusFilter === "active" && !task.done) ||
      (activeStatusFilter === "done" && task.done);

    const priorityMatch =
      activePriorityFilter === "all" || task.priority === activePriorityFilter;

    return statusMatch && priorityMatch;
  });
}

function renderCount() {
  const activeCount = tasks.filter((task) => !task.done).length;
  const total = tasks.length;

  taskCount.textContent =
    total === 0
      ? "0 tasks"
      : `${activeCount} active of ${total}`;
}

function formatPriority(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function renderEmptyMessage() {
  if (activeStatusFilter === "all" && activePriorityFilter === "all") {
    return "No tasks yet. Add your first one above.";
  }

  if (activeStatusFilter !== "all" && activePriorityFilter !== "all") {
    return `No ${activePriorityFilter} ${activeStatusFilter} tasks.`;
  }

  if (activeStatusFilter !== "all") {
    return `No ${activeStatusFilter} tasks.`;
  }

  return `No ${activePriorityFilter} priority tasks.`;
}

function render() {
  const filteredTasks = getFilteredTasks();
  list.innerHTML = "";

  if (filteredTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = renderEmptyMessage();
    list.append(empty);
  } else {
    filteredTasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = `todo-item${task.done ? " is-done" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.setAttribute("aria-label", `Mark '${task.text}' as done`);
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const text = document.createElement("span");
      text.className = "text";
      text.textContent = task.text;

      const priorityTag = document.createElement("span");
      priorityTag.className = `priority-tag ${task.priority}`;
      priorityTag.textContent = formatPriority(task.priority);

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete '${task.text}'`);
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      meta.append(text, priorityTag);
      item.append(checkbox, meta, deleteBtn);
      list.append(item);
    });
  }

  filterButtons.forEach((button) => {
    const group = button.dataset.filterGroup;
    const value = button.dataset.filter;
    const isActive =
      (group === "status" && value === activeStatusFilter) ||
      (group === "priority" && value === activePriorityFilter);

    button.classList.toggle("is-active", isActive);
  });

  renderCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  addTask(text, priorityInput.value);
  form.reset();
  priorityInput.value = "medium";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.filterGroup;

    if (group === "status") {
      activeStatusFilter = button.dataset.filter;
    }

    if (group === "priority") {
      activePriorityFilter = button.dataset.filter;
    }

    render();
  });
});

clearDoneButton.addEventListener("click", clearDoneTasks);

render();
