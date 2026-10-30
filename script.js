const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project-card");
function applyFilter(category) {
  projects.forEach(project => {
    project.classList.toggle("hidden", category !== "All" && project.dataset.category !== category);
  });
  filters.forEach(button => button.classList.toggle("active", button.dataset.filter === category));
}
filters.forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
document.querySelectorAll(".specialty-card[data-filter]").forEach(card => {
  card.addEventListener("click", () => applyFilter(card.dataset.filter));
});
document.querySelectorAll(".multimedia-subcategories button").forEach(button => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

const dialog = document.getElementById("projectDialog");
document.querySelectorAll(".details-button").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById("dialogTitle").textContent = button.dataset.title;
    document.getElementById("dialogDescription").textContent = button.dataset.description;
    document.getElementById("dialogTools").textContent = "Tools: " + button.dataset.tools;
    dialog.showModal();
  });
});
document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
document.getElementById("year").textContent = new Date().getFullYear();
