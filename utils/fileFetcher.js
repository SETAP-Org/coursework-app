
import { supabase, SHARED_FOLDERS_BUCKET } from "./supabase.js";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import officeparser from "officeparser";


const FILE_HANDLERS = {
    // Native types - sent inline as-is
    pdf: { mimeType: "application/pdf", extractor: null },
    txt: { mimeType: "text/plain", extractor: null },
    md: { mimeType: "text/markdown", extractor: null },
    markdown: { mimeType: "text/markdown", extractor: null },
    csv: { mimeType: "text/csv", extractor: null },
    html: { mimeType: "text/html", extractor: null },
    htm: { mimeType: "text/html", extractor: null },

    // Office types - text extracted on the server, sent as text/plain
    docx: { mimeType: "text/plain", extractor: extractDocx },
    xlsx: { mimeType: "text/plain", extractor: extractXlsx },
    xls: { mimeType: "text/plain", extractor: extractXlsx },
    pptx: { mimeType: "text/plain", extractor: extractPptx },
};

function getFileHandler(fileName) {
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    return FILE_HANDLERS[ext] ?? null;
}

/**
 * Resolve a file's MIME type from its name. Falls back to a generic binary
 * type if the extension isn't recognised.
 */
export function mimeTypeFromFileName(fileName) {
    const handler = getFileHandler(fileName);
    return handler?.mimeType ?? "application/octet-stream";
}

/**
 * Download a single file from the shared-folders Supabase bucket.
 *
 * @param {string} storagePath - The bucket-relative path stored in the
 *                               FILES table (e.g. "projects/<id>/<ts>_x.pdf")
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
 * Take a list of file metadata rows (as returned by getFilesByProjectIdModel)
 * and resolve them into the {name, mimeType, data} shape gemini.js expects.
 *
 * Office files are extracted to text here so the gemini util doesn't need
 * to know about format-specific quirks - it just sees text/plain.
 */
export async function loadFilesForGemini(fileRows) {
    const results = await Promise.all(
        fileRows.map(async (row) => {
            const handler = getFileHandler(row.file_name);
            if (!handler) return null;

            const buffer = await downloadFileBuffer(row.storage_path);
            if (!buffer) return null;

            // For native types, pass the buffer straight through.
            if (!handler.extractor) {
                return {
                    name: row.file_name,
                    mimeType: handler.mimeType,
                    data: buffer,
                };
            }

            // For Office types, extract text first.
            try {
                const text = await handler.extractor(buffer);
                if (!text || !text.trim()) return null;

                return {
                    name: row.file_name,
                    mimeType: "text/plain",
                    data: Buffer.from(text, "utf8"),
                };
            } catch (err) {
                console.error(
                    `Failed to extract text from '${row.file_name}':`,
                    err.message,
                );
                return null;
            }
        }),
    );

    return results.filter(Boolean);
}

// ---------------------------------------------------------------------------
// Format-specific extractors. Each takes a Buffer and returns a string of
// extracted text. Errors are caught by the caller above.
// ---------------------------------------------------------------------------

async function extractDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

function extractXlsx(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // For each sheet, dump as CSV so tabular data stays structured. Prefix
    // each sheet with its name so Gemini can refer to "the Tasks sheet" etc.
    const parts = [];
    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        parts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }
    return parts.join("\n\n");
}

async function extractPptx(buffer) {
    // officeparser handles pptx natively. Returns concatenated slide text.
    return await officeparser.parseOfficeAsync(buffer);
}