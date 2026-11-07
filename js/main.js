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

/* Accepts a YouTube link, a YouTube video ID, or a full YouTube <iframe> embed code.
   Facebook links and embeds still work as a fallback. */
function youtubeId(input) {
  const text = String(input).trim();
  if (/^[\w-]{11}$/.test(text)) return text;
  const url = facebookInputUrl(text);
  if (!url) return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
  if (url.searchParams.get("v")) return url.searchParams.get("v");
  const match = url.pathname.match(/^\/(?:embed|live|shorts)\/([\w-]{11})/);
  return match ? match[1] : null;
}

function youtubeStart(input) {
  const url = facebookInputUrl(input);
  const value = url?.searchParams.get("start") || url?.searchParams.get("t") || "";
  const seconds = parseInt(value, 10);
  return seconds > 0 ? String(seconds) : null;
}

/* Accepts a Facebook video link, an embed src, or a full <iframe> embed code.
   A t= value in the embed (t=20) starts playback at that second. */
function facebookInputUrl(input) {
  const src = String(input).match(/src="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") || String(input).trim();
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

function facebookVideoUrl(input) {
  const url = facebookInputUrl(input);
  if (!url) return String(input).trim();
  return url.pathname.includes("/plugins/video.php") ? url.searchParams.get("href") : url.href;
}

/* Only pass a start time when one is set; Facebook's player can pause itself
   right after it starts while handling a start offset. */
function embedSrc(video) {
  const id = youtubeId(video);
  if (id) {
    const params = new URLSearchParams({ rel: "0" });
    const start = youtubeStart(video);
    if (start) params.set("start", start);
    return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  }
  const start = facebookInputUrl(video)?.searchParams.get("t");
  const params = new URLSearchParams({
    href: facebookVideoUrl(video),
    show_text: "false",
  });
  if (start && /^\d+$/.test(start) && Number(start) > 0) params.set("t", start);
  return `https://www.facebook.com/plugins/video.php?${params}`;
}

function parseDate(value) {
  if (!value) return null;
  const text = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  const parts = iso ? [iso[1], iso[2], iso[3]] : us ? [us[3], us[1], us[2]] : null;
  if (!parts) return null;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "";
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
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.scrolling = "no";
  if (!eager) iframe.loading = "lazy";
  wrap.append(iframe);
  return wrap;
}

function metaRow(sermon) {
  const items = [
    ["i-calendar", formatDate(sermon.date)],
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

function sermonTime(sermon) {
  return parseDate(sermon.date)?.getTime() || 0;
}

function seriesSlug(title, used) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "series";
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

function prepareSeries(list) {
  const used = new Set();
  return list
    .map((item) => ({
      title: item.title || "Sermon series",
      summary: item.summary || "",
      slug: seriesSlug(item.title || "Sermon series", used),
      sermons: [...(item.sermons || [])].filter((sermon) => sermon.video).sort((a, b) => sermonTime(b) - sermonTime(a)),
    }))
    .filter((item) => item.sermons.length)
    .sort((a, b) => sermonTime(b.sermons[0]) - sermonTime(a.sermons[0]));
}

function latestSermon(series) {
  let found = null;
  series.forEach((item) => {
    item.sermons.forEach((sermon) => {
      if (!found || sermonTime(sermon) >= sermonTime(found.sermon)) found = { sermon, series: item };
    });
  });
  return found;
}

function formatRange(sermons) {
  const dates = sermons.map((sermon) => parseDate(sermon.date)).filter(Boolean).sort((a, b) => a - b);
  const start = dates[0];
  const end = dates.at(-1);
  if (!start) return "";
  if (!end || start.getTime() === end.getTime()) return formatDate(sermons[0].date);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startText = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endText = end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${startText} – ${endText}`;
}

function messageCount(count) {
  return count === 1 ? "1 message" : `${count} messages`;
}

function watchLink(video) {
  const id = youtubeId(video);
  const link = el("a", "text-link", id ? "Watch on YouTube" : "Watch on Facebook");
  link.href = id ? `https://www.youtube.com/watch?v=${id}` : facebookVideoUrl(video);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.insertAdjacentHTML("beforeend", '<svg class="icon" aria-hidden="true"><use href="#i-arrow" /></svg>');
  return link;
}

function writeSeriesIntro(series) {
  const intro = document.getElementById("series-intro");
  const current = series[0];
  if (!intro || !current || intro.dataset.ready) return;
  intro.dataset.ready = "true";
  const name = document.createElement("em");
  name.textContent = current.title;
  intro.append(document.createTextNode(" Right now we’re in "), name, document.createTextNode("."));
}

function renderSermons() {
  const featuredWrap = document.getElementById("sermon-featured");
  const seriesWrap = document.getElementById("sermon-series");
  if (!featuredWrap || !Array.isArray(window.SERIES)) return;

  const series = prepareSeries(window.SERIES);
  const latest = latestSermon(series);
  writeSeriesIntro(series);

  if (latest) {
    const details = el("div", "featured__details");
    details.append(el("p", "eyebrow", "Latest message"));
    const seriesLink = el("a", "", latest.series.title);
    seriesLink.href = `#${latest.series.slug}`;
    const seriesLine = el("p", "sermon-series-link");
    seriesLine.append(seriesLink);
    details.append(seriesLine);
    details.append(el("h2", "featured__title", latest.sermon.title || "Sunday message"));
    const latestMeta = metaRow(latest.sermon);
    if (latestMeta) details.append(latestMeta);
    if (latest.sermon.summary) details.append(el("p", "lede", latest.sermon.summary));
    details.append(watchLink(latest.sermon.video));
    featuredWrap.replaceChildren(videoFrame(latest.sermon, true), details);
  }

  if (!seriesWrap) return;
  if (!series.length) {
    const note = el("div", "empty-note");
    note.append(el("p", "", "More messages are on the way. In the meantime, you can find past services on our Facebook page."));
    const link = el("a", "text-link", "Visit our Facebook page");
    link.href = FB_PAGE;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    note.append(link);
    seriesWrap.replaceChildren(note);
    return;
  }

  const fragment = document.createDocumentFragment();
  if (series.length > 1) {
    const nav = el("nav", "series-nav");
    nav.setAttribute("aria-label", "Sermon series");
    series.forEach((item) => {
      const link = el("a", "", item.title);
      link.href = `#${item.slug}`;
      if (latest && item.slug === latest.series.slug) link.setAttribute("aria-current", "true");
      nav.append(link);
    });
    fragment.append(nav);
  }

  series.forEach((item) => {
    const article = el("article", "series");
    article.id = item.slug;
    const title = el("h3", "series__title", item.title);
    title.id = `${item.slug}-title`;
    article.setAttribute("aria-labelledby", title.id);
    const head = el("header", "series__head");
    head.append(title);
    const metaBits = [messageCount(item.sermons.length), formatRange(item.sermons)].filter(Boolean);
    if (metaBits.length) head.append(el("p", "series__meta", metaBits.join(" · ")));
    if (item.summary) head.append(el("p", "lede", item.summary));
    article.append(head);

    const grid = el("div", "sermon-grid");
    item.sermons.forEach((sermon) => {
      const card = el("article", "sermon-card");
      card.append(videoFrame(sermon, false));
      const body = el("div", "sermon-card__body");
      if (latest && sermon === latest.sermon) body.append(el("p", "sermon-flag", "Latest"));
      body.append(el("h4", "", sermon.title || "Sunday message"));
      const meta = metaRow(sermon);
      if (meta) body.append(meta);
      card.append(body);
      grid.append(card);
    });
    article.append(grid);
    fragment.append(article);
  });
  seriesWrap.replaceChildren(fragment);
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
contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const note = contactForm.querySelector(".form__note");
  const button = contactForm.querySelector("[type='submit']");
  const data = new FormData(contactForm);

  if (data.get("botcheck")) {
    contactForm.reset();
    if (note) note.textContent = "Message sent. The church office will get back to you.";
    return;
  }

  const name = String(data.get("name") || "").trim();
  data.set("subject", `Note from the website${name ? ` — ${name}` : ""}`);

  button.disabled = true;
  const label = button.textContent;
  button.textContent = "Sending…";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Request failed");
    contactForm.reset();
    if (note) note.textContent = "Message sent. The church office will get back to you.";
  } catch {
    if (note) note.textContent = "That didn’t send. Please try again, or call or email the office.";
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
});

/* ——— Footer year ——— */

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
