// UR10 unit tests: MIME type resolution for file names

// mimeTypeFromFileName is a pure utility — no DB, HTTP, or storage involved
const { mimeTypeFromFileName } = await import("../utils/fileFetcher.js");

describe('mimeTypeFromFileName resolves the correct MIME type from a file name', () => {

    test('valid: pdf extension resolves correct MIME type', () => {
        expect(mimeTypeFromFileName("report.pdf")).toBe("application/pdf");
    })

    // extension lookup should be case-insensitive
    test('valid: uppercase extension resolves correct MIME type', () => {
        expect(mimeTypeFromFileName("DATA.CSV")).toBe("text/csv");
    })

    test('valid: markdown extension resolves correct MIME type', () => {
        expect(mimeTypeFromFileName("notes.md")).toBe("text/markdown");
    })

    // docx is extracted server-side so the mime type is always text/plain
    test('valid: office docx extension resolves correct MIME type', () => {
        expect(mimeTypeFromFileName("report.docx")).toBe("text/plain");
    })

    test('invalid: unknown extension falls back to octet-stream', () => {
        expect(mimeTypeFromFileName("image.png")).toBe("application/octet-stream");
    })

    test('invalid: no extension falls back to octet-stream', () => {
        expect(mimeTypeFromFileName("noext")).toBe("application/octet-stream");
    })

    test('invalid: empty filename falls back to octet-stream', () => {
        expect(mimeTypeFromFileName("")).toBe("application/octet-stream");
    })
})
