const STORAGE_KEY = "coco-go-gpt-emp-7d";
const STORAGE_KEY_LEGACY = "coco-eb-gpt-emp-7d";
const ACCESS_TOKEN = "__COCO_ACCESS_TOKEN__";
const ACCESS_SESSION_KEY = "coco-go-access-ok";

function loadProgress() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      saveProgress(parsed);
      return parsed;
    }
    return {};
  } catch { return {}; }
}

function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

function readProgressState() {
  const progress = {};
  document.querySelectorAll("[data-day-check]").forEach((input) => {
    progress[String(input.dataset.dayCheck)] = !!input.checked;
  });
  return progress;
}

function updateProgressUI(progress) {
  const days = ["1", "2", "3", "4", "5", "6", "7"];
  const done = days.filter((d) => progress[d]).length;
  const pct = Math.round((done / 7) * 100);
  const fill = document.getElementById("progress-fill");
  const pctEl = document.getElementById("progress-pct");
  const doneEl = document.getElementById("days-done");
  const compactPct = document.getElementById("compact-pct");
  if (fill) {
    fill.style.width = `${pct}%`;
    fill.setAttribute("aria-valuenow", String(pct));
  }
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (doneEl) doneEl.textContent = String(done);
  if (compactPct) compactPct.textContent = `${pct}%`;
  if (pct === 100 && !updateProgressUI._celebrated) {
    updateProgressUI._celebrated = true;
    showToast("🎉 ¡Completaste los 7 días!");
  }
}
updateProgressUI._celebrated = false;

function panelHash(dayId) {
  if (dayId === "glosario") return "#panel-glosario";
  if (dayId === "bonus") return "#panel-bonus";
  return `#panel-${dayId}`;
}

function dayFromHash() {
  const id = (location.hash || "#panel-glosario").slice(1);
  if (id === "panel-glosario") return "glosario";
  if (id === "panel-bonus") return "bonus";
  const m = id.match(/^panel-(\d+)$/);
  return m ? m[1] : "glosario";
}

function syncPillActive(dayId) {
  document.querySelectorAll(".day-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.day === dayId);
  });
}

function showPanel(dayId) {
  const hash = panelHash(dayId);
  if (location.hash !== hash) {
    history.replaceState(null, "", hash);
  }
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    const show = panel.dataset.panel === dayId;
    panel.classList.toggle("active", show);
  });
  syncPillActive(dayId);
  window.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(observeReveals);
}

function initDayNav() {
  window.addEventListener("hashchange", () => {
    showPanel(dayFromHash());
  });
  document.querySelectorAll(".day-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      setTimeout(() => showPanel(pill.dataset.day), 0);
    });
  });
}

function initCheckboxes() {
  const saved = loadProgress();
  document.querySelectorAll("[data-day-check]").forEach((input) => {
    const day = String(input.dataset.dayCheck);
    input.checked = !!(saved[day] || saved[Number(day)]);
    input.addEventListener("change", () => {
      const p = readProgressState();
      saveProgress(p);
      updateProgressUI(p);
      if (input.checked) showToast(`✓ Día ${day} completado`);
    });
  });
  updateProgressUI(readProgressState());
}

function ariaLabelForCopyBtn(btn) {
  const target = btn.dataset.target || "";
  const dayMatch = target.match(/^prompt-d(\d+)/);
  if (dayMatch) return `Copiar prompt del día ${dayMatch[1]}`;
  const bonusMatch = target.match(/^prompt-b(\d+)/);
  if (bonusMatch) return `Copiar prompt bonus ${bonusMatch[1]}`;
  const label = btn.dataset.label || btn.textContent.trim();
  return label.startsWith("Copiar") ? label : `Copiar ${label}`;
}

function initCopyButtons() {
  document.querySelectorAll(".btn-copy").forEach((btn) => {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
    btn.setAttribute("aria-label", ariaLabelForCopyBtn(btn));
    btn.addEventListener("click", async () => {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      const text = el.textContent.trim();
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        btn.classList.add("copied");
        btn.textContent = "✓ Copiado";
        showToast("Copiado al portapapeles");
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = btn.dataset.label;
        }, 2000);
      } catch {
        if (fallbackCopy(text)) {
          btn.classList.add("copied");
          btn.textContent = "✓ Copiado";
          showToast("Copiado al portapapeles");
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.textContent = btn.dataset.label;
          }, 2000);
        } else {
          showToast("Mantené presionado el texto para copiar");
        }
      }
    });
  });
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (_) {}
  document.body.removeChild(ta);
  return ok;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function observeReveals(root) {
  const scope = root || document;
  scope.querySelectorAll(".card.reveal:not(.visible)").forEach((el, i) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 220);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
  });
}

function getActivePanel() {
  const checked = document.querySelector(".tab-input:checked");
  if (!checked) return document.querySelector("main .day-panel");
  const key = checked.id === "tab-glosario"
    ? "glosario"
    : checked.id === "tab-bonus"
      ? "bonus"
      : checked.id.replace("tab-", "");
  return document.querySelector(`.day-panel[data-panel="${key}"]`);
}

function resetPanelReveals() {
  const active = getActivePanel();
  if (!active) return;
  active.querySelectorAll(".card.reveal.visible").forEach((el) => el.classList.remove("visible"));
  observeReveals(active);
}

function getStickyStackHeight() {
  const brand = document.getElementById("brand-bar");
  const journey = document.getElementById("journey-sticky");
  return (brand?.offsetHeight || 0) + (journey?.offsetHeight || 0);
}

function scrollInstant(top) {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.max(0, top));
  requestAnimationFrame(() => {
    html.style.scrollBehavior = prev;
  });
}

function scrollToContentTop() {
  const main = document.querySelector("main");
  const panel = getActivePanel();
  if (!main) {
    scrollInstant(0);
    return;
  }

  const stackH = getStickyStackHeight();
  const anchor = panel?.querySelector(".day-header") || panel || main;
  const anchorTop = anchor.getBoundingClientRect().top + window.scrollY;
  scrollInstant(anchorTop - stackH);
}

function initDayTabScroll() {
  const onTabSwitch = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToContentTop();
        resetPanelReveals();
      });
    });
  };

  document.querySelectorAll(".day-pill[for]").forEach((label) => {
    label.addEventListener("click", onTabSwitch);
  });

  document.querySelectorAll(".tab-input").forEach((tab) => {
    tab.addEventListener("change", () => {
      if (tab.checked) onTabSwitch();
    });
  });

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#tab-glosario").slice(1);
    if (h.startsWith("tab-")) onTabSwitch();
  });
}

function isJourneyPinned() {
  const brand = document.getElementById("brand-bar");
  const journey = document.getElementById("journey-sticky");
  if (!brand || !journey) return false;
  const brandRect = brand.getBoundingClientRect();
  const journeyRect = journey.getBoundingClientRect();
  return journeyRect.top <= brandRect.bottom + 2;
}

function syncBrandOffset() {
  const brand = document.getElementById("brand-bar");
  if (!brand) return;
  document.documentElement.style.setProperty("--brand-offset", `${brand.offsetHeight}px`);
}

function anchorScrollOnLayoutShift(applyChange) {
  const anchor = document.querySelector("main");
  const before = anchor ? anchor.getBoundingClientRect().top : 0;

  applyChange();

  requestAnimationFrame(() => {
    syncBrandOffset();
    requestAnimationFrame(() => {
      if (!anchor) return;
      const after = anchor.getBoundingClientRect().top;
      const delta = after - before;
      if (Math.abs(delta) >= 1) scrollInstant(window.scrollY + delta);
    });
  });
}

function setHeroCollapsed(shouldCollapse) {
  if (shouldCollapse === setHeroCollapsed._state) return;
  anchorScrollOnLayoutShift(() => {
    setHeroCollapsed._state = shouldCollapse;
    document.body.classList.toggle("hero-collapsed", shouldCollapse);
  });
}
setHeroCollapsed._state = false;

function initHeroCollapse() {
  const hero = document.getElementById("inicio");
  if (!hero) return;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const h = hero.offsetHeight || 1;
      const collapseAt = h * 0.78;
      const expandAt = h * 0.1;
      const collapsed = setHeroCollapsed._state;

      if (!collapsed && y > collapseAt && isJourneyPinned()) {
        setHeroCollapsed(true);
      } else if (collapsed && y < expandAt) {
        setHeroCollapsed(false);
      }

      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", syncBrandOffset);
  syncBrandOffset();
  onScroll();
}

function initGlossaryList() {
  const list = document.getElementById("concept-list");
  const search = document.getElementById("glossary-search");
  const empty = document.getElementById("glossary-empty");
  if (!list) return;

  const cards = [...list.querySelectorAll("details.concept-card")];
  let locking = false;

  cards.forEach((card) => {
    card.addEventListener("toggle", () => {
      if (locking || !card.open) return;
      locking = true;
      cards.forEach((other) => {
        if (other !== card) other.open = false;
      });
      locking = false;
    });
  });

  if (!search) return;

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

  function filterCards() {
    const q = normalize(search.value.trim());
    let visible = 0;
    cards.forEach((card) => {
      const text = normalize(card.textContent || "");
      const show = !q || text.includes(q);
      card.classList.toggle("is-hidden", !show);
      if (!show) card.open = false;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  }

  search.addEventListener("input", filterCards);
}

function initPrintPdf() {
  const btn = document.getElementById("btn-print-pdf");
  if (!btn) return;
  btn.addEventListener("click", () => {
    document.body.classList.add("is-printing");
    document.querySelectorAll("details.concept-card, details.example").forEach((d) => { d.open = true; });
    document.querySelectorAll(".concept-card.is-hidden").forEach((c) => c.classList.remove("is-hidden"));
    showToast("Elegí 'Guardar como PDF' — puede tardar unos segundos");
    const cleanup = () => document.body.classList.remove("is-printing");
    window.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(() => window.print(), 500);
  });
}

function initAccessGate() {
  if (!ACCESS_TOKEN || ACCESS_TOKEN === "__COCO_ACCESS_TOKEN__") return;

  const gate = document.getElementById("access-gate");
  const input = document.getElementById("access-code-input");
  const submit = document.getElementById("access-code-submit");
  const error = document.getElementById("access-gate-error");
  if (!gate || !input || !submit) return;

  const params = new URLSearchParams(location.search);
  const fromUrl = (params.get("k") || "").trim();
  const stored = sessionStorage.getItem(ACCESS_SESSION_KEY) === "1";

  function unlock() {
    sessionStorage.setItem(ACCESS_SESSION_KEY, "1");
    document.body.classList.remove("access-locked");
    gate.hidden = true;
    if (fromUrl) {
      params.delete("k");
      const qs = params.toString();
      history.replaceState(null, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
    }
  }

  function tryCode(raw) {
    const code = (raw || "").trim();
    if (code.toUpperCase() === ACCESS_TOKEN.toUpperCase()) {
      if (error) error.textContent = "";
      unlock();
      return true;
    }
    if (error) error.textContent = "Código incorrecto. Revisá el email de compra.";
    return false;
  }

  if (stored || (fromUrl && tryCode(fromUrl))) return;

  document.body.classList.add("access-locked");
  gate.hidden = false;
  submit.addEventListener("click", () => tryCode(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryCode(input.value);
  });
}

function initMobileHint() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const hint = document.getElementById("mobile-hint");
  if (!hint) return;

  if (isIOS) {
    hint.hidden = false;
    const cssLoaded = getComputedStyle(document.body).fontFamily.includes("system-ui")
      || document.styleSheets.length > 0;
    const link = document.querySelector('link[rel="stylesheet"]');
    if (link) {
      link.addEventListener("error", () => { hint.hidden = false; });
    }
    requestAnimationFrame(() => {
      const test = document.querySelector(".brand-bar");
      if (test && getComputedStyle(test).position !== "sticky") {
        hint.hidden = false;
      }
    });
  }
}

function detectBrokenAssets() {
  const link = document.querySelector('link[href="assets/style.css"]');
  if (!link) return;
  const img = new Image();
  const timeout = setTimeout(() => {
    const hint = document.getElementById("mobile-hint");
    if (hint && /iPhone|iPad|Android/i.test(navigator.userAgent)) hint.hidden = false;
  }, 800);
  fetch(link.href, { method: "HEAD" }).catch(() => {
    clearTimeout(timeout);
    const hint = document.getElementById("mobile-hint");
    if (hint) hint.hidden = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-ready");

  initAccessGate();
  initCheckboxes();
  initCopyButtons();
  observeReveals();
  initGlossaryList();
  initHeroCollapse();
  initPrintPdf();
  initDayTabScroll();
  syncTabsFromHash();

  document.querySelectorAll(".day-pill[for]").forEach((label) => {
    label.addEventListener("click", () => {
      const id = label.getAttribute("for");
      if (id) history.replaceState(null, "", `#${id}`);
    });
  });
});

function syncTabsFromHash() {
  const hash = (location.hash || "#tab-glosario").slice(1);
  const tab = document.getElementById(hash);
  if (tab && tab.classList.contains("tab-input")) tab.checked = true;
  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#tab-glosario").slice(1);
    const el = document.getElementById(h);
    if (el && el.classList.contains("tab-input")) el.checked = true;
  });
}