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
        </li>`).join("");
}

async function uploadFile(file) {
  const { signedUrl, storagePath } = await fetch(`/api/projects/${projectId}/files/upload-init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name }),
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

document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await uploadFile(file);
  e.target.value = "";
});

loadFiles();
