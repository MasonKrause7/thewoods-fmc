const site = document.querySelector(".site");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ——— Nav ——— */

const navToggle = document.querySelector(".nav__toggle");

const navLabel = navToggle?.querySelector(".nav__label");

function setNavOpen(open) {
  navToggle?.setAttribute("aria-expanded", String(open));
  if (navLabel) navLabel.textContent = open ? "Close" : "Menu";
  site.classList.toggle("is-nav-open", open);
}

navToggle?.addEventListener("click", () => {
  setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && site.classList.contains("is-nav-open")) {
    setNavOpen(false);
    navToggle.focus();
  }
});

window.matchMedia("(min-width: 1041px)").addEventListener("change", (e) => {
  if (e.matches) setNavOpen(false);
});

function updateScrolled() {
  site.classList.toggle("is-scrolled", window.scrollY > 8);
}

window.addEventListener("scroll", updateScrolled, { passive: true });
updateScrolled();

/* ——— Hero slideshow ——— */

const SLIDE_MS = 7000;

function initSlideshow(hero) {
  const slides = [...hero.querySelectorAll(".hero__slide")];
  if (slides.length < 2) return;

  let index = 0;
  let timer = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === index);
      slide.classList.toggle("is-zooming", n === index);
    });
  }

  function schedule() {
    clearTimeout(timer);
    if (reducedMotion || document.hidden) return;
    timer = setTimeout(() => {
      show(index + 1);
      schedule();
    }, SLIDE_MS);
  }

  document.addEventListener("visibilitychange", schedule);

  /* Flush the unzoomed first frame so its zoom transitions in */
  void hero.offsetWidth;
  show(0);
  schedule();
}

const hero = document.querySelector(".hero");
if (hero) initSlideshow(hero);

/* ——— Sermons ——— */

const FB_PAGE = "https://www.facebook.com/100081895544129";

/* Accepts a Facebook video link, an embed src, or a full <iframe> embed code */
function facebookVideoUrl(input) {
  const src = input.match(/src="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") || input.trim();
  try {
    const url = new URL(src);
    return url.pathname.includes("/plugins/video.php") ? url.searchParams.get("href") : url.href;
  } catch {
    return src;
  }
}

function embedSrc(video) {
  const params = new URLSearchParams({ href: facebookVideoUrl(video), show_text: "false", t: "0" });
  return `https://www.facebook.com/plugins/video.php?${params}`;
}

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function videoFrame(sermon, eager) {
  const wrap = el("div", "video");
  if (sermon.aspect) wrap.style.aspectRatio = sermon.aspect;
  const iframe = document.createElement("iframe");
  iframe.src = embedSrc(sermon.video);
  iframe.title = sermon.title ? `Sermon video: ${sermon.title}` : "Sermon video";
  iframe.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.scrolling = "no";
  if (!eager) iframe.loading = "lazy";
  wrap.append(iframe);
  return wrap;
}

function metaRow(sermon) {
  const items = [
    ["i-calendar", formatDate(sermon.date)],
    ["i-user", sermon.speaker],
    ["i-book", sermon.scripture],
  ].filter(([, text]) => text);
  if (!items.length) return null;
  const row = el("p", "sermon-meta");
  items.forEach(([icon, text]) => {
    const span = el("span");
    span.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${icon}" /></svg>`;
    span.append(text);
    row.append(span);
  });
  return row;
}

function renderSermons() {
  const featuredWrap = document.getElementById("sermon-featured");
  const archiveWrap = document.getElementById("sermon-archive");
  if (!featuredWrap || !Array.isArray(window.SERMONS)) return;

  const sermons = [...window.SERMONS].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const [latest, ...past] = sermons;

  if (latest) {
    const details = el("div", "featured__details");
    details.append(el("p", "eyebrow", "Latest message"));
    details.append(el("h2", "featured__title", latest.title || "Sunday message"));
    const latestMeta = metaRow(latest);
    if (latestMeta) details.append(latestMeta);
    if (latest.summary) details.append(el("p", "lede", latest.summary));
    const link = el("a", "text-link", "Watch on Facebook");
    link.href = facebookVideoUrl(latest.video);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.insertAdjacentHTML("beforeend", '<svg class="icon" aria-hidden="true"><use href="#i-arrow" /></svg>');
    details.append(link);
    featuredWrap.replaceChildren(videoFrame(latest, true), details);
  }

  if (!archiveWrap) return;
  if (!past.length) {
    const note = el("div", "empty-note");
    note.append(el("p", "", "More messages are on the way. In the meantime, you can find past services on our Facebook page."));
    const link = el("a", "text-link", "Visit our Facebook page");
    link.href = FB_PAGE;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    note.append(link);
    archiveWrap.replaceChildren(note);
    return;
  }

  const grid = el("div", "sermon-grid");
  past.forEach((sermon) => {
    const card = el("article", "sermon-card");
    card.append(videoFrame(sermon, false));
    card.append(el("h3", "", sermon.title || "Sunday message"));
    const meta = metaRow(sermon);
    if (meta) card.append(meta);
    grid.append(card);
  });
  archiveWrap.replaceChildren(grid);
}

renderSermons();

/* ——— Scroll reveals ——— */

const revealObserver =
  "IntersectionObserver" in window && !reducedMotion
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
      )
    : null;

document.querySelectorAll(".reveal").forEach((node) => {
  if (revealObserver) revealObserver.observe(node);
  else node.classList.remove("reveal");
});

/* ——— Contact form ——— */

const contactForm = document.querySelector("form.form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();
  const subject = `Note from the website${name ? ` — ${name}` : ""}`;
  const body = [message, "", name && `Name: ${name}`, email && `Email: ${email}`].filter(Boolean).join("\n");
  window.location.href = `mailto:office@thewoodsfmc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* ——— Footer year ——— */

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
