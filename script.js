const STORAGE_KEY = "mochi-tasks-v1";
let tasks = loadTasks();
let filter = "all";


function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return []; 
  }
}
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn("Could not save tasks", err);
  }
}


const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const dueInput = document.getElementById("dueInput");
const list = document.getElementById("taskList");
const count = document.getElementById("count");
const filters = document.getElementById("filters");
const clearDone = document.getElementById("clearDone");


function addTask(text, due) {
  const clean = text.trim();
  if (!clean) return;
  tasks.unshift({ id: Date.now(), text: clean, done: false, due: due || "" });
  commit();
}
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  commit();
}
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  commit();
}
function commit() { saveTasks(); render(); }


function todayStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function dueInfo(due, done) {
  const day = new Date(due + "T00:00:00");
  const today = new Date(todayStr() + "T00:00:00");
  const diff = Math.round((day - today) / 86400000); // whole days from today
  if (done) return { label: "Due " + day.toLocaleDateString(undefined, { month: "short", day: "numeric" }), cls: "" };
  if (diff < 0) return { label: "Overdue by " + (-diff) + (diff === -1 ? " day" : " days"), cls: "late" };
  if (diff === 0) return { label: "Due today", cls: "today" };
  if (diff === 1) return { label: "Due tomorrow", cls: "" };
  return { label: "Due " + day.toLocaleDateString(undefined, { month: "short", day: "numeric" }), cls: "" };
}
dueInput.min = todayStr(); 


function render() {
  list.innerHTML = "";
  const visible = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done);

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.style.animation = "none";
    empty.style.display = "block";
    empty.innerHTML = '<span class="big">☁️</span>' +
      (tasks.length ? "Nothing in this view" : "No tasks yet. Type one above and press Enter.");
    list.appendChild(empty);
  }

  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = t.done ? "done" : "";
    li.dataset.id = t.id;

    const check = document.createElement("button");
    check.className = "check";
    check.type = "button";
    check.textContent = "✓";
    check.setAttribute("aria-label", t.done ? "Mark as not done" : "Mark as done");

    const body = document.createElement("div");
    body.className = "body";
    const span = document.createElement("span");
    span.className = "text";
    span.textContent = t.text; // textContent keeps user input safe
    body.appendChild(span);
    if (t.due) {
      const info = dueInfo(t.due, t.done);
      const badge = document.createElement("span");
      badge.className = "due " + info.cls;
      badge.textContent = "\ud83d\udcc5 " + info.label;
      body.appendChild(badge);
    }

    const del = document.createElement("button");
    del.className = "del";
    del.type = "button";
    del.textContent = "🗑️";
    del.setAttribute("aria-label", "Delete task");

    li.append(check, body, del);
    list.appendChild(li);
  });

  const left = tasks.filter(t => !t.done).length;
  count.textContent = tasks.length ? left + (left === 1 ? " task left" : " tasks left") : "";
  clearDone.hidden = !tasks.some(t => t.done);
  document.getElementById("greeting").textContent =
    tasks.length && left === 0 ? "All done! Time for snacks 🍓" : "Add something small and sweet to do";
}


form.addEventListener("submit", e => {
  e.preventDefault();
  addTask(input.value, dueInput.value);
  dueInput.value = "";
  input.value = "";
  input.focus();
});


list.addEventListener("click", e => {
  const li = e.target.closest("li[data-id]");
  if (!li) return;
  const id = Number(li.dataset.id);
  if (e.target.closest(".check")) toggleTask(id);
  if (e.target.closest(".del")) {
    li.classList.add("leaving");
    setTimeout(() => deleteTask(id), 220); // wait for the poof animation
  }
});

filters.addEventListener("click", e => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  filters.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === btn));
  render();
});

clearDone.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  commit();
});

const sky = document.getElementById("sky");
const icons = ["🌸", "⭐", "💖", "🍓", "✨", "🐰", "🍡", "🌷", "🫧"];
for (let i = 0; i < 16; i++) {
  const el = document.createElement("span");
  el.className = "float";
  el.textContent = icons[i % icons.length];
  el.style.left = Math.random() * 100 + "%";
  el.style.fontSize = 18 + Math.random() * 24 + "px";
  el.style.animationDuration = 12 + Math.random() * 14 + "s";
  el.style.animationDelay = -Math.random() * 20 + "s";
  sky.appendChild(el);
}
for (let i = 0; i < 3; i++) {
  const c = document.createElement("div");
  c.className = "cloud";
  c.style.top = 6 + i * 22 + "%";
  c.style.animationDuration = 50 + i * 20 + "s";
  c.style.animationDelay = -i * 18 + "s";
  c.style.opacity = 0.5 + i * 0.1;
  sky.appendChild(c);
}

render();
