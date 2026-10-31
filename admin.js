
const SUPABASE_URL = "https://kpdigtstlicertcclqyd.supabase.co";
const SUPABASE_KEY = "sb_publishable_q63m2BV5Bl4PzayE_rhm-A_rvOltDfq";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const loginForm = document.getElementById("loginForm");
const projectForm = document.getElementById("projectForm");
const dashboard = document.getElementById("dashboard");
const loginMessage = document.getElementById("loginMessage");
const projectMessage = document.getElementById("projectMessage");
const projectsList = document.getElementById("projectsList");
const cvForm = document.getElementById("cvForm");
const cvMessage = document.getElementById("cvMessage");
const cvStatus = document.getElementById("cvStatus");

const CV_PATH = "cv/current.pdf";

const BUCKET = "portfolio-media";
const CLOUDINARY_CLOUD_NAME = "eanf63bz";
const CLOUDINARY_UPLOAD_PRESET = "portfolio_videos";
// تسجيل الدخول
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "جاري تسجيل الدخول...";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "خطأ في تسجيل الدخول: " + error.message;
    return;
  }

  loginMessage.textContent = "تم تسجيل الدخول بنجاح";
  await showDashboard();
});

// عرض لوحة التحكم
async function showDashboard() {
  loginForm.hidden = true;
  dashboard.hidden = false;
  await loadProjects();
}

// التحقق من جلسة المدير
async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    await showDashboard();
  }
}

// رفع الملفات إلى Storage
async function uploadFile(file, folder) {
  if (!file) return null;

  const extension = file.name.split(".").pop();
  const fileName =
    folder + "/" + crypto.randomUUID() + "." + extension;

  const { error } = await supabaseClient.storage
    .from(BUCKET)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
// CV Upload
async function loadCVStatus() {
  const { data: files, error } = await supabaseClient
    .storage
    .from(BUCKET)
    .list("cv");

  if (error) {
    cvStatus.textContent = "تعذر التحقق من ملف CV";
    return;
  }

  const exists = files.some(file => file.name === "current.pdf");

  cvStatus.textContent = exists
    ? "يوجد ملف CV مرفوع حاليًا"
    : "لا يوجد ملف CV مرفوع حاليًا";
}

cvForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = document.getElementById("cvFile").files[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    cvMessage.textContent = "من فضلك اختر ملف PDF فقط";
    return;
  }

  cvMessage.textContent = "جاري رفع ملف CV...";

  const { error } = await supabaseClient
    .storage
    .from(BUCKET)
    .upload(CV_PATH, file, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "0"
    });

  if (error) {
    cvMessage.textContent = "حدث خطأ: " + error.message;
    return;
  }

  cvMessage.textContent = "تم رفع CV بنجاح";
  cvForm.reset();

  await loadCVStatus();
});
async function uploadVideoToCloudinary(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "فشل رفع الفيديو");
  }

  return result.secure_url;
}

// إضافة مشروع
projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  projectMessage.textContent = "جاري إضافة المشروع...";

  try {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const tools = document.getElementById("tools").value;
    const projectUrl = document.getElementById("projectUrl").value;

    const imageFile = document.getElementById("image").files[0];
    const videoFile = document.getElementById("video").files[0];

    const imageUrl = await uploadFile(imageFile, "images");
    const videoUrl = await uploadVideoToCloudinary(videoFile);

    const { error } = await supabaseClient
      .from("projects")
      .insert([{
        title,
        description,
        category,
        tools,
        image_url: imageUrl,
        video_url: videoUrl,
        project_url: projectUrl || null
      }]);

    if (error) throw error;

    projectMessage.textContent = "تمت إضافة المشروع بنجاح";
    projectForm.reset();

    await loadProjects();

  } catch (error) {
    projectMessage.textContent = "حدث خطأ: " + error.message;
  }
});

// حماية النصوص عند عرضها في الصفحة
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// عرض المشاريع
async function loadProjects() {
  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    projectsList.textContent = "خطأ في تحميل المشاريع: " + error.message;
    return;
  }

  projectsList.replaceChildren();

  if (data.length === 0) {
    projectsList.textContent = "لا توجد مشاريع حتى الآن";
    return;
  }

  data.forEach(project => {
    const card = document.createElement("div");
    card.style.cssText =
      "border:1px solid #999;padding:15px;margin:15px 0;border-radius:10px";

    card.innerHTML = `
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.category)}</p>
      <p>${escapeHTML(project.description)}</p>
      <button type="button" data-action="edit">تعديل</button>
      <button type="button" data-action="delete">حذف</button>
    `;

    card.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editProject(project);
    });

    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteProject(project.id);
    });

    projectsList.appendChild(card);
  });
}

// تعديل المشروع
async function editProject(project) {
  const title = prompt("اسم المشروع:", project.title);
  if (title === null) return;

  const description = prompt("وصف المشروع:", project.description || "");
  if (description === null) return;

  const tools = prompt("الأدوات المستخدمة:", project.tools || "");
  if (tools === null) return;

  const { error } = await supabaseClient
    .from("projects")
    .update({ title, description, tools })
    .eq("id", project.id);

  if (error) {
    alert("حدث خطأ أثناء التعديل: " + error.message);
    return;
  }

  alert("تم تعديل المشروع بنجاح");
  await loadProjects();
}

// حذف المشروع
async function deleteProject(id) {
  if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;

  const { error } = await supabaseClient
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    alert("حدث خطأ أثناء الحذف: " + error.message);
    return;
  }

  alert("تم حذف المشروع بنجاح");
  await loadProjects();
}

// تسجيل الخروج
document.getElementById("logoutButton").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  dashboard.hidden = true;
  loginForm.hidden = false;
  loginForm.reset();
});

checkSession();

