  // scripts.js
 
// ---------- Utilities ----------
const USER_NAME = "Rahaf Salhab";
const USER_ABOUT = "I’m Rahaf Selhab, 22 year old , from Tulkarm - Palestine. I’m studying Computer Systems Engineering at Palestine Technical University – Kadoorie, with a strong interest in web development and user interface design.";
const USER_HEADSHOT = "starter/images/rahaf_headshot.png";

const DATA_BASE = "starter/data/";
const IMG_BASE_FROM_DATA = "starter/data/";

function resolveFromData(relPath) {
  if (typeof relPath !== 'string') return relPath;
  const prefix = '../images/';
  if (relPath.startsWith(prefix)) return 'starter/images/' + relPath.slice(prefix.length);
  return relPath;
}

function setBackgroundImage(el, url) {
  el.style.backgroundImage = `url("${url}")`;
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center center";
  el.style.backgroundRepeat = "no-repeat";
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return await res.json();
}

// ---------- About Me ----------
async function populateAbout() {
  try {
    const headerTitle = document.querySelector("header h1");
    if (headerTitle) headerTitle.textContent = USER_NAME || headerTitle.textContent;
  } catch(_) {}

  try {
    const data = await fetchJSON(`${DATA_BASE}aboutMeData.json`);
    const aboutMeDiv = document.getElementById("aboutMe");
    if (!aboutMeDiv) return;

    aboutMeDiv.textContent = "";

    const p = createEl("p", null, USER_ABOUT || data?.aboutMe || "No biography provided.");
    const headshotContainer = createEl("div", "headshotContainer");
    const img = createEl("img");
    img.src = USER_HEADSHOT || resolveFromData(data?.headshot ?? "../images/headshot.webp");
    img.alt = "Headshot";
    headshotContainer.appendChild(img);

    const frag = document.createDocumentFragment();
    frag.appendChild(p);
    frag.appendChild(headshotContainer);
    aboutMeDiv.appendChild(frag);
  } catch (err) {
    console.error(err);
  }
}

// ---------- Projects ----------
let projects = [];
let currentProjectIndex = 0;

function applySpotlight(project) {
  const spotlight = document.getElementById("projectSpotlight");
  const titles = document.getElementById("spotlightTitles");
  if (!spotlight || !titles) return;

  const name = project?.project_name ?? "Untitled Project";
  const long = project?.long_description ?? "No description available.";
  const url = project?.url ?? "#";

  const spotlightImg = resolveFromData(project?.spotlight_image ?? "../images/spotlight_placeholder_bg.webp");
  setBackgroundImage(spotlight, spotlightImg);

  titles.textContent = "";
  const h3 = createEl("h3", null, name);
  const p = createEl("p", null, long);
  const a = createEl("a", null, "Click here to see more...");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";

  const frag = document.createDocumentFragment();
  frag.appendChild(h3);
  frag.appendChild(p);
  frag.appendChild(a);
  titles.appendChild(frag);
}

function buildProjectCard(project, index) {
  const card = createEl("div", "projectCard");
  card.id = project?.project_id ?? `project_${index}`;
  const cardImg = resolveFromData(project?.card_image ?? "../images/card_placeholder_bg.webp");
  setBackgroundImage(card, cardImg);

  const h4 = createEl("h4", null, project?.project_name ?? "Untitled Project");
  const p = createEl("p", null, project?.short_description ?? "No teaser available.");
  card.appendChild(h4);
  card.appendChild(p);

  card.addEventListener("click", () => {
    currentProjectIndex = index;
    applySpotlight(project);
  });

  return card;
}

function populateProjectsList() {
  const list = document.getElementById("projectList");
  if (!list) return;
  list.textContent = "";

  const frag = document.createDocumentFragment();
  projects.forEach((proj, i) => frag.appendChild(buildProjectCard(proj, i)));
  list.appendChild(frag);
}

async function initProjects() {
  try {
    projects = await fetchJSON(`${DATA_BASE}projectsData.json`);
    if (!Array.isArray(projects)) projects = [];
    populateProjectsList();
    if (projects.length > 0) {
      currentProjectIndex = 0;
      applySpotlight(projects[0]);
    }
  } catch (err) {
    console.error(err);
  }
}

// ---------- Project List Scrolling (Arrows) ----------
function initProjectArrows() {
  const container = document.getElementById("projectList");
  const left = document.querySelector("#projectNavArrows .arrow-left");
  const right = document.querySelector("#projectNavArrows .arrow-right");
  if (!container || !left || !right) return;

  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
  const SCROLL_STEP = 280;
  let holdInterval = null;

  function scrollDir(direction) {
    if (isDesktop()) {
      container.scrollBy({ top: direction * SCROLL_STEP, left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: direction * SCROLL_STEP, top: 0, behavior: "smooth" });
    }
  }

  function startHold(direction) {
    if (holdInterval) clearInterval(holdInterval);
    holdInterval = setInterval(() => scrollDir(direction), 130);
  }
  function stopHold() {
    if (holdInterval) {
      clearInterval(holdInterval);
      holdInterval = null;
    }
  }

  left.addEventListener("click", () => scrollDir(-1));
  right.addEventListener("click", () => scrollDir(1));

  ["mousedown", "touchstart"].forEach(evt =>
    left.addEventListener(evt, () => startHold(-1), { passive: true })
  );
  ["mousedown", "touchstart"].forEach(evt =>
    right.addEventListener(evt, () => startHold(1), { passive: true })
  );
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evt => {
    left.addEventListener(evt, stopHold, { passive: true });
    right.addEventListener(evt, stopHold, { passive: true });
  });
}

// ---------- Continuous Scroll Enhancement ----------
function initContinuousScroll() {
  const container = document.getElementById("projectList");
  const left = document.querySelector("#projectNavArrows .arrow-left");
  const right = document.querySelector("#projectNavArrows .arrow-right");
  if (!container || !left || !right) return;

  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
  const SCROLL_STEP = 4;
  const INTERVAL = 10;
  let scrollInterval = null;

  function startScroll(direction) {
    stopScroll();
    scrollInterval = setInterval(() => {
      if (isDesktop()) {
        container.scrollBy({ top: direction * SCROLL_STEP, left: 0 });
      } else {
        container.scrollBy({ left: direction * SCROLL_STEP, top: 0 });
      }
    }, INTERVAL);
  }

  function stopScroll() {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  }

  ["mousedown", "touchstart"].forEach(evt => {
    left.addEventListener(evt, () => startScroll(-1), { passive: true });
    right.addEventListener(evt, () => startScroll(1), { passive: true });
  });

  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evt => {
    left.addEventListener(evt, stopScroll, { passive: true });
    right.addEventListener(evt, stopScroll, { passive: true });
  });
}

// ---------- Form Validation ----------
function initFormValidation() {
  const form = document.getElementById("formSection");
  const emailInput = document.getElementById("contactEmail");
  const messageInput = document.getElementById("contactMessage");
  const emailError = document.getElementById("emailError");
  const messageError = document.getElementById("messageError");
  const charsLeft = document.getElementById("charactersLeft");

  if (!form || !emailInput || !messageInput || !emailError || !messageError || !charsLeft) return;

  const ILLEGAL = /[^a-zA-Z0-9@._-]/;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MAX = 300;

  function updateCount() {
    const len = messageInput.value.length;
    charsLeft.textContent = `Characters: ${len}/${MAX}`;
    if (len > MAX) {
      charsLeft.classList.add("error");
    } else {
      charsLeft.classList.remove("error");
    }
  }

  messageInput.addEventListener("input", updateCount);
  updateCount();

  function showError(el, msg) {
    el.textContent = msg;
    if (msg) el.classList.add("error"); else el.classList.remove("error");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    showError(emailError, "");
    showError(messageError, "");

    const emailVal = emailInput.value.trim();
    const msgVal = messageInput.value;

    if (!emailVal) {
      showError(emailError, "Email is required.");
      valid = false;
    }
    if (!msgVal) {
      showError(messageError, "Message is required.");
      valid = false;
    }

    if (emailVal && ILLEGAL.test(emailVal)) {
      showError(emailError, "Email contains illegal characters.");
      valid = false;
    }
    if (msgVal && ILLEGAL.test(msgVal)) {
      showError(messageError, "Message contains illegal characters.");
      valid = false;
    }

    if (emailVal && !EMAIL.test(emailVal)) {
      showError(emailError, "Please enter a valid email address.");
      valid = false;
    }

    if (msgVal.length > MAX) {
      showError(messageError, `Message must be ${MAX} characters or less.`);
      valid = false;
    }

    if (valid) {
      alert("✅ Form submitted successfully. Client-side validation passed.");
    }
  });
}

// ---------- Footer ----------
function initFooter() {
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <p>© 2025 ${USER_NAME}. All rights reserved.</p>
    <div class="social-links">
      <a href="https://github.com/Rahaf-Salhab" target="_blank" rel="noopener">GitHub</a> |
      <a href="https://www.linkedin.com/in/rahafsalhab/" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  `;
  document.body.appendChild(footer);
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  await populateAbout();
  await initProjects();
  initProjectArrows();
  initContinuousScroll();
  initFormValidation();
  initFooter();
});
