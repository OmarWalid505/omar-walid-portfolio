const SUPABASE_URL = "https://kpdigtstlicertcclqyd.supabase.co";
const SUPABASE_KEY = "sb_publishable_q63m2BV5Bl4PzayE_rhm-A_rvOltDfq";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});


const filters = document.querySelectorAll(".filter");
const projectGrid = document.getElementById("projectGrid");
const dialog = document.getElementById("projectDialog");

// فلترة المشاريع

// فلترة المشاريع
function applyFilter(category) {
  const projects = document.querySelectorAll(".project-card");

  projects.forEach(project => {
    const projectCategory = project.dataset.category;

    const matches =
      category === "All" ||
      projectCategory === category ||
      (category === "Multimedia" &&
        ["Video Editing", "Graphic Design"].includes(projectCategory));

    project.classList.toggle("hidden", !matches);
  });

  filters.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === category
    );
  });
}

// تشغيل أزرار الفلترة
filters.forEach(button => {
  button.addEventListener("click", () => {
    console.log("Selected filter:", button.dataset.filter);

    applyFilter(button.dataset.filter);

    console.log(
      "Visible projects:",
      [...document.querySelectorAll(".project-card")]
        .filter(project => !project.classList.contains("hidden")).length
    );
  });
});

// أزرار التخصصات
document.querySelectorAll(".specialty-card[data-filter]").forEach(card => {
  card.addEventListener("click", () => {
    applyFilter(card.dataset.filter);
  });
});

// تصنيفات Multimedia الفرعية
document.querySelectorAll(".multimedia-subcategories button").forEach(button => {
  button.addEventListener("click", () => {
    applyFilter(button.dataset.filter);
  });
});

// حماية النصوص
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// تحميل المشاريع من Supabase
async function loadPortfolioProjects() {
  projectGrid.innerHTML = "<p>Loading projects...</p>";

  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Projects loading error:", error.message);
    projectGrid.textContent = "Unable to load projects.";
    return;
  }

  projectGrid.replaceChildren();

  if (data.length === 0) {
    projectGrid.textContent = "No projects available yet.";
    return;
  }

  data.forEach(project => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.dataset.category = project.category;

    let thumbnail = `<span>${escapeHTML(project.category)}</span>`;

    if (project.image_url) {
      thumbnail = `<img src="${escapeHTML(project.image_url)}" alt="${escapeHTML(project.title)}">`;
    } else if (project.video_url) {
      thumbnail = `<video src="${escapeHTML(project.video_url)}" muted playsinline preload="metadata"></video>`;
    }

    card.innerHTML = `
      <div class="project-thumb">
        ${thumbnail}
      </div>

      <div class="project-info">
        <div>
          <h3>${escapeHTML(project.title)}</h3>
          <p>${escapeHTML(project.description)}</p>
        </div>

        <button
          class="details-button"
          data-title="${escapeHTML(project.title)}"
          data-description="${escapeHTML(project.description)}"
          data-tools="${escapeHTML(project.tools)}"
          type="button">
          ↗
        </button>
      </div>

      <span class="tag">${escapeHTML(project.category)}</span>
    `;

    projectGrid.appendChild(card);
  });

  applyFilter("All");
}

// تفاصيل المشروع
// Image Gallery
const imageViewer = document.getElementById("imageViewer");
console.log("Image Viewer:", imageViewer);
const viewerImage = document.getElementById("viewerImage");
const imageViewerClose = document.getElementById("imageViewerClose");
const prevImage = document.getElementById("prevImage");
const nextImage = document.getElementById("nextImage");
const imageCounter = document.getElementById("imageCounter");

let galleryImages = [];
let currentImageIndex = 0;

function showGalleryImage() {
  viewerImage.src = galleryImages[currentImageIndex];

  imageCounter.textContent =
    `${currentImageIndex + 1} / ${galleryImages.length}`;

  prevImage.style.display =
    galleryImages.length > 1 ? "block" : "none";

  nextImage.style.display =
    galleryImages.length > 1 ? "block" : "none";
}

function openGallery(images, index) {
  galleryImages = images;
  currentImageIndex = index;

  showGalleryImage();
  imageViewer.showModal();
}

function changeGalleryImage(direction) {
  currentImageIndex =
    (currentImageIndex + direction + galleryImages.length) %
    galleryImages.length;

  showGalleryImage();
}

prevImage.addEventListener("click", () => {
  changeGalleryImage(-1);
});

nextImage.addEventListener("click", () => {
  changeGalleryImage(1);
});

imageViewerClose.addEventListener("click", () => {
  imageViewer.close();
});

imageViewer.addEventListener("click", event => {
  if (event.target === imageViewer) {
    imageViewer.close();
  }
});

// Project Details and Image Click
projectGrid.addEventListener("click", event => {

  const button = event.target.closest(".details-button");

  if (button) {
    document.getElementById("dialogTitle").textContent =
      button.dataset.title;

    document.getElementById("dialogDescription").textContent =
      button.dataset.description;

    document.getElementById("dialogTools").textContent =
      "Tools: " + button.dataset.tools;

    dialog.showModal();
    return;
  }

  const image = event.target.closest(".project-thumb img");
  console.log("Image clicked:", image);

if (image) {
  console.log("Image clicked:", image);
  console.log("Image URL:", image.src);
  console.log("Viewer:", imageViewer);

  openGallery([image.src], 0);

  console.log("Viewer opened:", imageViewer.open);
  return;
}
});

// Close Project Details
document.getElementById("dialogClose").addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    dialog.close();
  }
});

// Keyboard Navigation
document.addEventListener("keydown", event => {
  if (!imageViewer.open) return;

  if (event.key === "ArrowRight") {
    changeGalleryImage(1);
  }

  if (event.key === "ArrowLeft") {
    changeGalleryImage(-1);
  }
});

// Current Year
document.getElementById("year").textContent =
  new Date().getFullYear();

// Load Projects
if (window.location.hash === "#contact") {
  history.scrollRestoration = "manual";
}

loadPortfolioProjects().then(() => {
  if (window.location.hash === "#contact") {
    document.getElementById("contact").scrollIntoView();
  }
});
