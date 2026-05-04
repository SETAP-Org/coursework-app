(async function () {
  const data = window.scriptData.contributionData || {};
  const contributions = (data.contributions || []).map((c) => ({
    username: c.username,
    percentage: c.pct_of_project,
    tasks_completed: c.tasks_completed ?? 0,
    user_weight: c.user_weight ?? 0,
  }));

  const canvas = document.querySelector("#contributions-chart");
  const ctx = canvas.getContext("2d");

  const rootStyles = getComputedStyle(document.documentElement);
  const accent = (rootStyles.getPropertyValue("--accent") || "#7c5cff").trim();
  const accent2 = (rootStyles.getPropertyValue("--bad") || "#ff5a7a").trim();
  const palette = [accent, accent2, "#6f9efb", "#ffd166", "#06d6a0", "#8d6ef6"];

  function shadeColor(hex, amt) {
    if (!hex) return "#000000";
    let col = hex.replace("#", "").trim();
    if (col.length === 3)
      col = col
        .split("")
        .map((c) => c + c)
        .join("");
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  // Build gradients for chart slices
  const colors = contributions.map((_, i) => palette[i % palette.length]);
  const gradients = colors.map((color) => {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
    g.addColorStop(0, color);
    g.addColorStop(1, shadeColor(color, -25));
    return g;
  });

  // Create doughnut chart
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: contributions.map((r) => r.username),
      datasets: [
        {
          data: contributions.map((r) => r.percentage),
          backgroundColor: gradients,
          borderColor:
            rootStyles.getPropertyValue("--card") || "rgba(255,255,255,0.06)",
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
            color: rootStyles.getPropertyValue("--text") || "#ffffff",
            usePointStyle: true,
            pointStyle: "rectRounded",
            boxWidth: 18,
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor:
            rootStyles.getPropertyValue("--card") || "rgba(10,12,18,0.95)",
          titleColor: rootStyles.getPropertyValue("--text") || "#ffffff",
          bodyColor: rootStyles.getPropertyValue("--text") || "#ffffff",
          borderColor: "rgba(255,255,255,0.04)",
          borderWidth: 1,
          padding: 10,
          displayColors: true,
        },
      },
    },
  });

  // Render the contributions list in the info card
  function formatNumber(n) {
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  const listRoot = document.querySelector("#contributions-list");
  if (listRoot) {
    // clear
    listRoot.innerHTML = "";

    // for each contributor, create a row
    contributions.forEach((c, idx) => {
      const row = document.createElement("div");
      row.className = "contrib-row";

      const left = document.createElement("div");
      left.className = "contrib-left";

      const badge = document.createElement("span");
      badge.className = "contrib-badge";
      // colour badge using palette
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

      listRoot.appendChild(row);
    });
  }
})();
