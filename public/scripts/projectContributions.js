async function projectContributions() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  "use strict";

  // ---------- Utilities ----------
  function getRootStyle(prop, fallback) {
    const rootStyles = getComputedStyle(document.documentElement);
    return (rootStyles.getPropertyValue(prop) || fallback).trim();
  }

  // Shade a hex color by `amt` (positive = lighter, negative = darker).
  function shadeColor(hex, amt) {
    if (!hex) return "#000000";
    let col = hex.replace("#", "").trim();
    if (col.length === 3)
      col = col
        .split("")
        .map((c) => c + c)
        .join("");
    const num = parseInt(col, 16);
    if (Number.isNaN(num)) return "#000000";
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    const out = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
    return `#${out}`;
  }

  // Create linear gradients for each color using the canvas height (fallback to 400).
  function createGradients(ctx, canvas, colors) {
    const height = canvas && canvas.height ? canvas.height : 400;
    return colors.map((color) => {
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, color);
      g.addColorStop(1, shadeColor(color, -25));
      return g;
    });
  }

  // ---------- Data preparation ----------
  const data = (window.scriptData && window.scriptData.contributionData) || {};
  const contributions = (
    Array.isArray(data.contributions) ? data.contributions : []
  ).map((c) => ({
    username: c.username ?? "Unknown",
    percentage: Number.isFinite(Number(c.pct_of_project))
      ? Number(c.pct_of_project)
      : 0,
    tasks_completed: c.tasks_completed ?? 0,
    user_weight: c.user_weight ?? 0,
  }));

  // ---------- Chart setup ----------
  const canvas = document.querySelector("#contributions-chart");
  const ctx = canvas ? canvas.getContext && canvas.getContext("2d") : null;

  // Gather colors from CSS custom properties with sensible fallbacks.
  const accent = getRootStyle("--accent", "#7c5cff");
  const accent2 = getRootStyle("--bad", "#ff5a7a");
  const palette = [accent, accent2, "#6f9efb", "#ffd166", "#06d6a0", "#8d6ef6"];

  // Build a color array for contributors (wraps palette).
  const colors = contributions.map((_, i) => palette[i % palette.length]);

  // Only try to create the Chart if we have a canvas/context and Chart.js is available.
  if (ctx && typeof window.Chart === "function") {
    const gradients = createGradients(ctx, canvas, colors);
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: contributions.map((r) => r.username),
        datasets: [
          {
            data: contributions.map((r) => r.percentage),
            backgroundColor: gradients,
            borderColor: getRootStyle("--card", "rgba(255,255,255,0.06)"),
            borderWidth: 2,
            hoverOffset: 12,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        cutout: "60%",
        layout: { padding: 12 },
        elements: { arc: { borderAlign: "inner" } },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: getRootStyle("--text", "#ffffff"),
              usePointStyle: true,
              pointStyle: "rectRounded",
              boxWidth: 18,
              padding: 12,
            },
          },
          tooltip: {
            backgroundColor: getRootStyle("--card", "rgba(10,12,18,0.95)"),
            titleColor: getRootStyle("--text", "#ffffff"),
            bodyColor: getRootStyle("--text", "#ffffff"),
            borderColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            padding: 10,
            displayColors: true,
          },
        },
      },
    });
  } else {
  }

  // ---------- Contributions list rendering ----------
  // Use a single Intl.NumberFormat for consistent formatting.
  const numFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  function formatNumber(n) {
    return numFmt.format(Number(n));
  }

  function renderContributionsList(rootEl) {
    // Clear existing content.
    rootEl.innerHTML = "";
    const frag = document.createDocumentFragment();

    contributions.forEach((c, idx) => {
      const row = document.createElement("div");
      row.className = "contrib-row";

      const left = document.createElement("div");
      left.className = "contrib-left";

      const badge = document.createElement("span");
      badge.className = "contrib-badge";
      badge.style.background = colors[idx % colors.length] || "#888";
      badge.setAttribute("aria-hidden", "true");

      const name = document.createElement("div");
      name.className = "contrib-name";
      name.textContent = c.username;

      left.appendChild(badge);
      left.appendChild(name);

      const right = document.createElement("div");
      right.className = "contrib-right";

      const pct = document.createElement("div");
      pct.className = "contrib-pct";
      pct.textContent = `${formatNumber(c.percentage)}%`;

      const meta = document.createElement("div");
      meta.className = "contrib-meta";
      meta.textContent = `${c.tasks_completed} tasks · ${formatNumber(c.user_weight)} weight`;

      right.appendChild(pct);
      right.appendChild(meta);

      row.appendChild(left);
      row.appendChild(right);
      frag.appendChild(row);
    });

    rootEl.appendChild(frag);
  }

  const listRoot = document.querySelector("#contributions-list");
  if (listRoot) renderContributionsList(listRoot);

  // hide loading screen
  loading.style.display = "none";
};

projectContributions();
