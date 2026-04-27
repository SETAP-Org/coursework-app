(async function () {
  const data = window.scriptData.contributionData || {};

  const data_formatted = (data.contributions || []).map((c) => ({
    username: c.username,
    percentage: c.pct_of_project,
  }));

  const canvas = document.querySelector("#contributions-chart");
  const ctx = canvas.getContext("2d");

  // Try to pick up theme colors from CSS variables; fall back to hardcoded palette.
  const rootStyles = getComputedStyle(document.documentElement);
  const accent = (rootStyles.getPropertyValue("--accent") || "#2aa6ff").trim();
  const accent2 = (
    rootStyles.getPropertyValue("--accent-2") || "#ff5a7a"
  ).trim();
  const palette = [
    accent || "#2aa6ff",
    accent2 || "#ff5a7a",
    "#6f9efb",
    "#ffd166",
    "#06d6a0",
    "#8d6ef6",
    "#f082ac",
  ];

  // Simple helper to darken/lighten a hex color by `amt` (-255..255)
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

  // Build gradients for each slice so the chart looks richer on a dark background
  const colors = data_formatted.map((_, i) => palette[i % palette.length]);
  const gradients = colors.map((color) => {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
    g.addColorStop(0, color);
    g.addColorStop(1, shadeColor(color, -30));
    return g;
  });

  // Build chart
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data_formatted.map((r) => r.username),
      datasets: [
        {
          label: "Contribution %",
          data: data_formatted.map((r) => r.percentage),
          backgroundColor: gradients,
          borderColor:
            rootStyles.getPropertyValue("--panel-border") ||
            "rgba(255,255,255,0.08)",
          borderWidth: 2,
          hoverOffset: 12,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      cutout: "60%", // gives a "donut" look with center space
      layout: { padding: 12 },
      elements: {
        arc: { borderAlign: "inner" },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: rootStyles.getPropertyValue("--text-muted") || "#c9d6ff",
            usePointStyle: true,
            pointStyle: "rectRounded",
            boxWidth: 18,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor:
            rootStyles.getPropertyValue("--panel-bg") || "rgba(10,12,18,0.95)",
          titleColor: rootStyles.getPropertyValue("--text") || "#ffffff",
          bodyColor: rootStyles.getPropertyValue("--text-muted") || "#c9d6ff",
          borderColor: "rgba(255,255,255,0.04)",
          borderWidth: 1,
          padding: 10,
          displayColors: true,
        },
      },
    },
  });
})();
