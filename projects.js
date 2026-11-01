const SUPABASE_URL = "https://kpdigtstlicertcclqyd.supabase.co";
const SUPABASE_KEY = "sb_publishable_q63m2BV5Bl4PzayE_rhm-A_rvOltDfq";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
  });
});

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
const viewerVideo = document.getElementById("viewerVideo");
const imageViewerClose = document.getElementById("imageViewerClose");
const prevImage = document.getElementById("prevImage");
const nextImage = document.getElementById("nextImage");
const imageCounter = document.getElementById("imageCounter");
const viewerDescription = document.getElementById("viewerDescription");

let galleryImages = [];
let currentImageIndex = 0;

function showGalleryImage() {
  const currentMedia = galleryImages[currentImageIndex];
  

  if (currentMedia.type === "video") {
    viewerImage.hidden = true;
    viewerVideo.hidden = false;

    viewerVideo.src = currentMedia.url;
    viewerVideo.load();
    viewerVideo.play();

  } else {
    viewerVideo.pause();
    viewerVideo.removeAttribute("src");
    viewerVideo.load();

    viewerVideo.hidden = true;
    viewerImage.hidden = false;
    viewerImage.src = currentMedia.url;
  }

  imageCounter.textContent =
    `${currentImageIndex + 1} / ${galleryImages.length}`;

  prevImage.style.display =
    galleryImages.length > 1 ? "block" : "none";

  nextImage.style.display =
    galleryImages.length > 1 ? "block" : "none";
}

function openGallery(images, index, description = "") {
  galleryImages = images;
  currentImageIndex = index;

  viewerDescription.textContent = description;

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
  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();
  imageViewer.close();
});

imageViewer.addEventListener("close", () => {
  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();
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
const video = event.target.closest(".project-thumb video");

if (image || video) {
  const media = image || video;
  const projectCard = media.closest(".project-card");

  const description = projectCard.querySelector(".details-button")
    ?.dataset.description || "";

  const gallery = image
    ? [{ type: "image", url: image.src }]
    : [{ type: "video", url: video.src }];

  openGallery(gallery, 0, description);
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
loadPortfolioProjects().then(() => {
  const requestedFilter = new URLSearchParams(window.location.search).get("filter");

  const validFilters = [
    "Programming",
    "Video Editing",
    "Graphic Design"
  ];

  applyFilter(
    validFilters.includes(requestedFilter) ? requestedFilter : "All"
  );

  if (window.location.hash === "#contact") {
    const contact = document.getElementById("contact");

    if (contact) {
      contact.scrollIntoView();
    }
  }
});
