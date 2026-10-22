const themes = {
  dark: {
    label: "Dark",
    blurb: "Dusk tones and cream type over full-bleed forest photography.",
  },
  light: {
    label: "Light",
    blurb: "Warm paper backgrounds with the primary color as the accent.",
  },
  contrasting: {
    label: "Contrasting",
    blurb: "Bold primary panels against cream, with maple highlights.",
  },
};

const primaries = [
  { id: "forest", name: "Forest", note: "Logo green", hex: "#15522f" },
  { id: "evergreen", name: "Evergreen", note: "Deep pine teal", hex: "#1b5450" },
  { id: "sage", name: "Sage", note: "Soft & earthy", hex: "#55704e" },
  { id: "lake", name: "Lake", note: "Michigan blue", hex: "#1f4a6e" },
  { id: "cedar", name: "Cedar", note: "Warm red-brown", hex: "#7c3a24" },
];

const PAGES = ["home", "about", "contact", "give"];
const STORE_KEY = "woods-primary";

const panels = document.querySelectorAll("[data-theme-panel]");
const themeButtons = document.querySelectorAll(".seg button");
const meta = document.getElementById("theme-meta");
const swatchWrap = document.getElementById("swatches");
const swatchName = document.getElementById("swatch-name");
const dock = document.querySelector(".dock");

const aliases = { trailhead: "dark", invitation: "light", clearing: "contrasting" };

let current = { theme: "dark", page: "home", primary: "forest" };

function storedPrimary() {
  try {
    return localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
}

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "dark/home";
  const [themePart, pagePart, colorPart] = raw.split("/");
  const resolved = aliases[themePart] || themePart;
  const theme = themes[resolved] ? resolved : "dark";
  const page = PAGES.includes(pagePart) ? pagePart : "home";
  const fallback = storedPrimary() || current.primary;
  const primary = primaries.some((p) => p.id === colorPart) ? colorPart : fallback;
  return { theme, page, primary };
}

/* ——— Primary color ——— */

primaries.forEach((p) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "swatch";
  btn.setAttribute("role", "radio");
  btn.setAttribute("aria-label", `${p.name} — ${p.note}`);
  btn.title = `${p.name} · ${p.note}`;
  btn.dataset.primary = p.id;
  btn.style.setProperty("--c", p.hex);
  btn.addEventListener("click", () => setRoute({ ...current, primary: p.id }));
  swatchWrap.append(btn);
});

function applyPrimary(id) {
  const p = primaries.find((x) => x.id === id) || primaries[0];
  document.documentElement.style.setProperty("--primary", p.hex);
  swatchWrap.querySelectorAll(".swatch").forEach((s) => {
    s.setAttribute("aria-checked", String(s.dataset.primary === p.id));
  });
  swatchName.innerHTML = `${p.name}<small>${p.note}</small>`;
  try {
    localStorage.setItem(STORE_KEY, p.id);
  } catch {}
}

/* ——— Motion ——— */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver =
  "IntersectionObserver" in window && !reducedMotion
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("is-in");
            revealObserver.unobserve(el);
            const delay = parseInt(el.style.getPropertyValue("--d"), 10) || 0;
            setTimeout(() => el.classList.remove("reveal", "is-in"), 1100 + delay);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
      )
    : null;

function observeReveals(root) {
  root.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.remove("reveal");
  });
}

function restartMotion(root) {
  root
    .querySelectorAll(
      ".d-hero__content > *, .l-hero__text > *, .l-hero__media, .c-hero__panel-inner > *, .page-hero__inner > *, .page-head__inner > *"
    )
    .forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
}

function updateScrolled() {
  const active = document.getElementById(`c-${current.theme}`);
  active?.classList.toggle("is-scrolled", window.scrollY > 24);
}

/* ——— Routing ——— */

function closeMenus() {
  document.querySelectorAll(".nav__toggle").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  document.querySelectorAll(".site").forEach((site) => site.classList.remove("is-nav-open"));
}

function setRoute(next, { push = false } = {}) {
  const changedView = next.theme !== current.theme || next.page !== current.page;
  current = next;
  const { theme, page, primary } = next;

  applyPrimary(primary);

  panels.forEach((panel) => {
    const match = panel.id === `c-${theme}`;
    panel.hidden = !match;
    if (!match) return;

    panel.dataset.page = page;
    panel.querySelectorAll("[data-page-view]").forEach((view) => {
      view.hidden = view.getAttribute("data-page-view") !== page;
    });
    panel.querySelectorAll("[data-nav]").forEach((link) => {
      const active = link.getAttribute("data-nav") === page;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  });

  themeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === theme));
  });

  const info = themes[theme];
  if (meta && info) meta.innerHTML = `<strong>${info.label}</strong> — ${info.blurb}`;

  const hash = `#${theme}/${page}/${primary}`;
  if (push) history.pushState(null, "", hash);
  else history.replaceState(null, "", hash);

  if (changedView) {
    closeMenus();
    const active = document.getElementById(`c-${theme}`);
    window.scrollTo({ top: 0, behavior: "instant" });
    restartMotion(active);
    observeReveals(active);
    /* Tip 3 keeps the mobile menu open so the highlight still fits */
    if (typeof tourStep === "number" && tourStep >= 0 && steps[tourStep]?.openNav) {
      setMobileNavOpen(true);
    }
  }
  updateScrolled();
}

function applyFromLocation() {
  setRoute(parseHash());
}

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setRoute({ ...current, theme: btn.dataset.theme }, { push: true });
  });
});

document.querySelectorAll(".nav__toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const site = btn.closest(".site");
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    site?.classList.toggle("is-nav-open", !open);
  });
});

document.querySelectorAll(".scroll-cue").forEach((cue) => {
  cue.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(cue.getAttribute("href").slice(1));
    target?.scrollIntoView({ behavior: "smooth" });
  });
});

/* Placeholder CTAs (e.g. Give online) — don't clear the hash / switch themes */
document.addEventListener("click", (e) => {
  const noop = e.target.closest("[data-noop]");
  if (!noop) return;
  e.preventDefault();
});

/* ——— Dock ——— */

function setDockMin(min) {
  dock.classList.toggle("is-min", min);
}

const dockHide = dock.querySelector(".dock__min:not(.dock__help)");
const dockOpen = dock.querySelector(".dock__open");

dockHide.addEventListener("click", () => setDockMin(true));
dockOpen.addEventListener("click", () => setDockMin(false));

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "h" || e.key === "H") setDockMin(!dock.classList.contains("is-min"));
});

/* ——— Guided tips ——— */

const TOUR_KEY = "woods-tour-done";
const tour = document.getElementById("tour");
const ring = document.getElementById("tour-ring");
const tourCount = document.getElementById("tour-count");
const tourTitle = document.getElementById("tour-title");
const tourText = document.getElementById("tour-text");
const tourTry = document.getElementById("tour-try");
const tourDots = document.getElementById("tour-dots");
const tourBack = tour.querySelector(".tour__back");
const tourNext = tour.querySelector(".tour__next");
const tourNextLabel = document.getElementById("tour-next-label");

const isShown = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};

const activeSite = () => document.getElementById(`c-${current.theme}`);

const steps = [
  {
    title: "Switch between the 3 directions",
    text: "These buttons flip the whole site between <strong>Dark</strong>, <strong>Light</strong>, and <strong>Contrasting</strong>.",
    try: "Try it — pick a different direction now.",
    target: () => dock.querySelector(".seg"),
    openDock: true,
  },
  {
    title: "Try a primary color",
    text: "Tap a dot to recolor the site. Your color stays put as you switch directions, so you can compare them side by side.",
    try: "Try it — tap a color, then switch directions.",
    target: () => dock.querySelector(".swatches"),
    openDock: true,
  },
  {
    title: "Explore the pages",
    text: "Use the menu at the top of each design to visit <strong>Home</strong>, <strong>About</strong>, <strong>Contact</strong>, and <strong>Give</strong>.",
    try: "Try it — open another page.",
    openNav: true,
    target: () => {
      const site = activeSite();
      if (!site) return null;
      const toggle = site.querySelector(".nav__toggle");
      const menu = site.querySelector(".nav__menu");
      const links = site.querySelector(".nav__links");
      /* Mobile: wrap the open dropdown panel; otherwise the hamburger */
      if (toggle && getComputedStyle(toggle).display !== "none") {
        return isShown(menu) ? menu : toggle;
      }
      return links;
    },
  },
  {
    title: "Hide or show the controls",
    text: "Tap the <strong>arrow</strong> to tuck this bar away for a clean view. Tap <strong>Review options</strong> to bring it back. Keyboard: <kbd>H</kbd>.",
    try: "Try it — hide the bar, then bring it back.",
    target: () => (dock.classList.contains("is-min") ? dockOpen : dockHide),
  },
];

let tourStep = -1;
let tourFrame = 0;

tourDots.innerHTML = steps.map(() => "<i></i>").join("");

function setMobileNavOpen(open) {
  const site = activeSite();
  if (!site) return;
  const toggle = site.querySelector(".nav__toggle");
  if (!toggle || getComputedStyle(toggle).display === "none") return;
  toggle.setAttribute("aria-expanded", String(open));
  site.classList.toggle("is-nav-open", open);
}

function placeTour() {
  if (tourStep < 0) return;
  const target = steps[tourStep].target();
  if (!isShown(target)) {
    tourFrame = requestAnimationFrame(placeTour);
    return;
  }

  const r = target.getBoundingClientRect();
  const pad = 8;
  ring.style.top = `${r.top - pad}px`;
  ring.style.left = `${r.left - pad}px`;
  ring.style.width = `${r.width + pad * 2}px`;
  ring.style.height = `${r.height + pad * 2}px`;
  /* Tall panels (mobile menu) need a modest radius — pill math turns them into ovals */
  const isBlock = r.height > 72;
  ring.style.borderRadius = isBlock
    ? `${Math.min(18, r.width / 2 + pad)}px`
    : `${Math.min(r.height / 2 + pad, 999)}px`;

  const gap = 16;
  const margin = 12;
  const w = tour.offsetWidth;
  const h = tour.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fitsAbove = r.top - gap - h >= margin;
  const preferBelow = r.top + r.height / 2 < vh / 2;
  const side = preferBelow || !fitsAbove ? "bottom" : "top";
  const top = side === "top" ? r.top - gap - h : r.bottom + gap;

  const cx = r.left + r.width / 2;
  const left = Math.max(margin, Math.min(cx - w / 2, vw - w - margin));
  const arrowX = Math.max(18, Math.min(cx - left, w - 18));

  tour.dataset.side = side;
  tour.style.setProperty("--tour-shift", side === "top" ? "8px" : "-8px");
  tour.style.top = `${top}px`;
  tour.style.left = `${left}px`;
  tour.style.setProperty("--arrow-x", `${arrowX}px`);

  tourFrame = requestAnimationFrame(placeTour);
}

function showStep(i) {
  tourStep = i;
  const step = steps[i];
  if (step.openDock) setDockMin(false);
  setMobileNavOpen(Boolean(step.openNav));

  tourCount.textContent = `Tip ${i + 1} of ${steps.length}`;
  tourTitle.textContent = step.title;
  tourText.innerHTML = step.text;
  tourTry.textContent = step.try || "";
  tourBack.disabled = i === 0;
  tourNextLabel.textContent = i === steps.length - 1 ? "Done" : "Next";
  tourDots.querySelectorAll("i").forEach((d, n) => d.classList.toggle("is-on", n === i));

  const wasHidden = tour.hidden;
  tour.hidden = false;
  ring.hidden = false;
  tour.classList.remove("is-entering");
  void tour.offsetWidth;
  tour.classList.add("is-entering");

  cancelAnimationFrame(tourFrame);
  if (wasHidden) {
    tour.style.transition = ring.style.transition = "none";
    placeTour();
    void tour.offsetWidth;
    tour.style.transition = ring.style.transition = "";
  } else {
    placeTour();
  }
}

function startTour() {
  showStep(0);
  tourNext.focus({ preventScroll: true });
}

function endTour() {
  tourStep = -1;
  cancelAnimationFrame(tourFrame);
  tour.hidden = true;
  ring.hidden = true;
  setMobileNavOpen(false);
  try {
    localStorage.setItem(TOUR_KEY, "1");
  } catch {}
}

tourNext.addEventListener("click", () => {
  if (tourStep >= steps.length - 1) endTour();
  else showStep(tourStep + 1);
});

tourBack.addEventListener("click", () => {
  if (tourStep > 0) showStep(tourStep - 1);
});

tour.querySelector(".tour__close").addEventListener("click", endTour);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && tourStep >= 0) endTour();
});

dock.querySelector(".dock__help").addEventListener("click", startTour);

let tourDone = false;
try {
  tourDone = localStorage.getItem(TOUR_KEY) === "1";
} catch {}
if (!tourDone) setTimeout(startTour, 700);

window.addEventListener("scroll", updateScrolled, { passive: true });
window.addEventListener("hashchange", applyFromLocation);
window.addEventListener("popstate", applyFromLocation);

current = { ...parseHash(), theme: "" };
applyFromLocation();
