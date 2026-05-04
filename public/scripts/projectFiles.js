const { projectId } = window.scriptData;

async function loadFiles() {
  const files = await fetch(`/api/projects/${projectId}/files/metadata`).then(r => r.json());
  const list = document.getElementById("file-list");
  list.innerHTML = files.length === 0
    ? "<li class='no-files'>No files uploaded yet.</li>"
    : files.map(f => `
        <li class="file-item">
          <span class="file-name">${f.file_name}</span>
          <span class="file-meta">${(f.size / 1024).toFixed(1)} KB &bull; ${new Date(f.date_uploaded).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
          <button class="download-btn" data-path="${f.storage_path}" data-name="${f.file_name}">Download</button>
        </li>`).join("");

  list.querySelectorAll(".download-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const { signedUrl } = await fetch(`/api/projects/${projectId}/files/download?storagePath=${encodeURIComponent(btn.dataset.path)}`).then(r => r.json());

      if ((btn.dataset.name || "").toLowerCase().endsWith(".pdf")) {
        const opened = window.open(signedUrl, "_blank");
        if (!opened) window.location.href = signedUrl;
        return;
      }

      const a = document.createElement("a");
      a.href = signedUrl;
      a.download = "";
      a.click();
    });
  });
}


async function uploadFile(file) {
  const { signedUrl, storagePath } = await fetch(`/api/projects/${projectId}/files/upload-init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, size: file.size }),
  }).then(r => r.json());

  await fetch(signedUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });

  await fetch(`/api/projects/${projectId}/files/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, storagePath, size: file.size }),
  });

  await loadFiles();
}

document.getElementById("upload-button").addEventListener("click", () => document.getElementById("file-input").click());

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) {
    alert("File size exceeds the maximum limit of 10 MB.");
    e.target.value = "";
    return;
  }
  await uploadFile(file);
  e.target.value = "";
});

loadFiles();
