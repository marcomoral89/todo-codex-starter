const STORAGE_KEY = "todo-app-tasks-v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearDoneButton = document.getElementById("clear-done");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
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
  if (activeFilter === "active") {
    return tasks.filter((task) => !task.done);
  }

  if (activeFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function renderCount() {
  const activeCount = tasks.filter((task) => !task.done).length;
  const total = tasks.length;

  taskCount.textContent =
    total === 0
      ? "0 tasks"
      : `${activeCount} active of ${total}`;
}

function render() {
  const filteredTasks = getFilteredTasks();
  list.innerHTML = "";

  if (filteredTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent =
      activeFilter === "all"
        ? "No tasks yet. Add your first one above."
        : `No ${activeFilter} tasks.`;
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

      const text = document.createElement("span");
      text.className = "text";
      text.textContent = task.text;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete '${task.text}'`);
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      item.append(checkbox, text, deleteBtn);
      list.append(item);
    });
  }

  filterButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.filter === activeFilter
    );
  });

  renderCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }

  addTask(text);
  form.reset();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

clearDoneButton.addEventListener("click", clearDoneTasks);

render();
