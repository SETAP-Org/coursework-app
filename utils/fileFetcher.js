
import { supabase, SHARED_FOLDERS_BUCKET } from "./supabase.js";

// Map common file extensions to MIME types Gemini understands. We deliberately
// keep this list short - anything not mapped here will be reported as
// "application/octet-stream" and skipped by the gemini util's filter, which
// is the safe default.
const EXTENSION_TO_MIME = {
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    markdown: "text/markdown",
    csv: "text/csv",
    html: "text/html",
    htm: "text/html",
};

/**
 * Resolve a file's MIME type from its name.
 */
export function mimeTypeFromFileName(fileName) {
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    return EXTENSION_TO_MIME[ext] ?? "application/octet-stream";
}

/**
 * Download a single file from the shared-folders Supabase bucket.
 *
 * @param {string} storagePath  - The bucket-relative path stored in the
 *                                FILES table (e.g. "projects/<id>/<ts>_x.pdf")
 * @returns {Promise<Buffer|null>}  Buffer of the file's contents, or null if
 *                                  the download failed.
 */
export async function downloadFileBuffer(storagePath) {
    const { data, error } = await supabase
        .storage
        .from(SHARED_FOLDERS_BUCKET)
        .download(storagePath);

    if (error || !data) {
        console.error(`Failed to download '${storagePath}':`, error?.message);
        return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * take a list of file metadata rows (returned by
 * getFilesByProjectIdModel) and turn them the
 * shape that gemini.js expects.
 *
 * Files that fail to download or have an unrecognised MIME type are simply
 * ignored - the caller doesn't need to care, the gemini util will note any
 * skipped attachments to the model.
 */
export async function loadFilesForGemini(fileRows) {
    const results = await Promise.all(
        fileRows.map(async (row) => {
            const mimeType = mimeTypeFromFileName(row.file_name);
            const data = await downloadFileBuffer(row.storage_path);
            if (!data) return null;
            return { name: row.file_name, mimeType, data };
        }),
    );

    return results.filter(Boolean);
}