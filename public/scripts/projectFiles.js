const { projectId, isTeamLeader } = window.scriptData;

function formatFileDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function renderFiles(list, files) {
  list.innerHTML = files.length === 0
    ? "<li class='no-files'>No files uploaded yet.</li>"
    : files.map((file) => `
        <li class="file-item">
          <div class="file-copy">
            <span class="file-name">${file.file_name}</span>
            <span class="file-meta">${(file.size / 1024).toFixed(1)} KB &bull; ${formatFileDate(file.date_uploaded)}</span>
          </div>
          <div class="file-actions">
            <button class="download-btn" data-path="${file.storage_path}" data-name="${file.file_name}">Download</button>
            ${isTeamLeader ? `<button class="delete-btn" data-file-id="${file.file_id}" data-file-name="${file.file_name}">Delete</button>` : ""}
          </div>
        </li>`).join("");
}

function bindDownloadHandlers(list) {
  list.querySelectorAll(".download-btn").forEach((btn) => {
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

function bindDeleteHandlers(list) {
  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = window.confirm("Are you sure you want to delete this file?");
      if (!confirmed) return;

      const response = await fetch(`/api/projects/${projectId}/files/${btn.dataset.fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || `Failed to delete ${btn.dataset.fileName}.`);
        return;
      }

      await loadFiles();
    });
  });
}

async function loadFiles() {
  const list = document.getElementById("file-list");
  let files = [];

  try {
    const response = await fetch(`/api/projects/${projectId}/files/metadata`);
    if (!response.ok) {
      throw new Error(`Failed to load files: ${response.status}`);
    }
    files = await response.json();
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li class='no-files'>Unable to load files right now.</li>";
    return;
  }

  renderFiles(list, files);
  bindDownloadHandlers(list);
  if (isTeamLeader) bindDeleteHandlers(list);
}


async function uploadFile(file) {
  const initResponse = await fetch(`/api/projects/${projectId}/files/upload-init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, size: file.size }),
  });

  const initData = await initResponse.json();

  if (!initResponse.ok) {
    alert(initData.error || "This file could not be uploaded.");
    return;
  }

  const { signedUrl, storagePath } = initData;

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
