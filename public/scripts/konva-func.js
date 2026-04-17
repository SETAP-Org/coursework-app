export async function saveNotesToDB(projectId, text, x, y) {
    await fetch ("/api/notes/saveNote", {
        method: "POST",
        headers: {'content-type': "application/json"},
        body: JSON.stringify({ projectId, text, x, y })
    });
}

export async function deleteNoteFromDB(projectId, text, x, y) {
    await fetch ("/api/notes/deleteNote", {
        method: "POST",
        headers: {'content-type': "application/json"},
        body: JSON.stringify({ projectId, text, x, y })
    });
}

export async function getNotesFromDB(projectId) {
    const response = await fetch(`/api/notes/getNotes?projectId=${projectId}`);
    const data = await response.json();
    return data.notes;
}