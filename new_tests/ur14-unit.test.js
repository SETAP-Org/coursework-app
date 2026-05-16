import { jest } from "@jest/globals";

const mockGenerateContent = jest.fn();
const mockDownload = jest.fn();
const mockSheetToCsv = jest.fn().mockReturnValue("col1,col2\nval1,val2");
const mockXlsxRead = jest.fn().mockReturnValue({ SheetNames: ["Sheet1"], Sheets: { Sheet1: {} } });

await jest.unstable_mockModule("@google/genai", () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: { generateContent: mockGenerateContent },
    })),
}));

await jest.unstable_mockModule("../utils/supabase.js", () => ({
    SHARED_FOLDERS_BUCKET: "test-bucket",
    supabase: {
        storage: {
            from: () => ({ download: mockDownload }),
        },
    },
}));

await jest.unstable_mockModule("mammoth", () => ({
    default: { extractRawText: jest.fn().mockResolvedValue({ value: "Extracted docx content." }) },
}));

await jest.unstable_mockModule("xlsx", () => ({
    read: mockXlsxRead,
    utils: { sheet_to_csv: mockSheetToCsv },
}));

await jest.unstable_mockModule("officeparser", () => ({
    default: { parseOfficeAsync: jest.fn().mockResolvedValue("") },
}));

const { loadFilesForGemini } = await import("../utils/fileFetcher.js");
const { getGeminiResponseWithFiles } = await import("../utils/gemini.js");

describe('loadFilesForGemini converts project files into Gemini-ready buffers', () => {

    beforeEach(() => {
        mockDownload.mockReset();
        const fakeBuffer = new Uint8Array(Buffer.from("fake content")).buffer;
        mockDownload.mockResolvedValue({ data: { arrayBuffer: async () => fakeBuffer }, error: null });
    });

    test('valid: pdf and txt pass through, docx and xlsx are extracted to text', async () => {
        const fileRows = [
            { file_name: "report.pdf",    storage_path: "path/report.pdf" },
            { file_name: "notes.txt",     storage_path: "path/notes.txt" },
            { file_name: "document.docx", storage_path: "path/document.docx" },
            { file_name: "data.xlsx",     storage_path: "path/data.xlsx" },
        ];

        const results = await loadFilesForGemini(fileRows);

        expect(results).toHaveLength(4);
        expect(results.find(r => r.name === "report.pdf").mimeType).toBe("application/pdf");
        expect(results.find(r => r.name === "notes.txt").mimeType).toBe("text/plain");

        const docx = results.find(r => r.name === "document.docx");
        expect(docx.mimeType).toBe("text/plain");
        expect(docx.data.toString()).toBe("Extracted docx content.");

        const xlsx = results.find(r => r.name === "data.xlsx");
        expect(xlsx.mimeType).toBe("text/plain");
        expect(xlsx.data.toString()).toContain("col1,col2");
    })

    test('invalid: unsupported file type is silently dropped', async () => {
        const results = await loadFilesForGemini([{ file_name: "image.png", storage_path: "path/image.png" }]);

        expect(results).toHaveLength(0);
        expect(mockDownload).not.toHaveBeenCalled();
    })

    test('valid: failed download for one file is silently dropped, others still returned', async () => {
        mockDownload
            .mockResolvedValueOnce({ data: null, error: new Error("Storage error") })
            .mockResolvedValueOnce({ data: { arrayBuffer: async () => new Uint8Array(Buffer.from("fake")).buffer }, error: null });

        const results = await loadFilesForGemini([
            { file_name: "report.pdf", storage_path: "path/report.pdf" },
            { file_name: "notes.txt",  storage_path: "path/notes.txt" },
        ]);

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("notes.txt");
    })

    test('valid: empty input returns empty array without touching storage', async () => {
        const results = await loadFilesForGemini([]);

        expect(results).toHaveLength(0);
        expect(mockDownload).not.toHaveBeenCalled();
    })

    test('invalid: extractor failure drops that file but other files are still returned', async () => {
        const mammoth = await import("mammoth");
        mammoth.default.extractRawText.mockRejectedValueOnce(new Error("Extraction failed"));

        const results = await loadFilesForGemini([
            { file_name: "document.docx", storage_path: "path/document.docx" },
            { file_name: "report.pdf",    storage_path: "path/report.pdf" },
        ]);

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("report.pdf");
    })
})

describe('getGeminiResponseWithFiles calls the Gemini API and returns the model reply', () => {

    beforeEach(() => {
        process.env.GEMINI_API_KEY = "test-key";
        mockGenerateContent.mockReset();
    });

    test('valid: valid prompt with small files returns the model reply string', async () => {
        mockGenerateContent.mockResolvedValue({ text: "The pdf contains a report and the txt contains notes." });

        const result = await getGeminiResponseWithFiles("what is in these files?", [
            { name: "doc.pdf",   mimeType: "application/pdf", data: Buffer.alloc(1 * 1024 * 1024) },
            { name: "notes.txt", mimeType: "text/plain",      data: Buffer.alloc(100 * 1024) },
        ]);

        expect(result).toBe("The pdf contains a report and the txt contains notes.");
    })

    test('invalid: SDK throws — error is rethrown to caller', async () => {
        mockGenerateContent.mockRejectedValue(new Error("Invalid API key"));

        await expect(
            getGeminiResponseWithFiles("what is in these files?", [])
        ).rejects.toThrow("Invalid API key");
    })

    test('valid: file exceeding 15MB budget is skipped and Gemini is still called without it', async () => {
        mockGenerateContent.mockResolvedValue({ text: "Here is my response." });

        const result = await getGeminiResponseWithFiles("summarise the file", [
            { name: "large.pdf", mimeType: "application/pdf", data: Buffer.alloc(20 * 1024 * 1024) },
        ]);

        expect(result).toBe("Here is my response.");

        const calledWith = mockGenerateContent.mock.calls[0][0];
        const hasInlineData = calledWith.contents.some(part => part.inlineData !== undefined);
        expect(hasInlineData).toBe(false);
    })
})
