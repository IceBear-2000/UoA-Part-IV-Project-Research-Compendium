import "server-only";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export type DocumentTextResult = { text: string } | { error: string };

// PPTX/images etc. are referenced by filename only — see spec's "Document
// parsing" decision. Callers should check the file extension before calling.
export async function extractDocumentText(
  buffer: Buffer,
  fileName: string,
): Promise<DocumentTextResult> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  try {
    if (ext === "pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      if (!result.text.trim()) return { error: "PDF has no extractable text." };
      return { text: result.text };
    }

    if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value.trim()) return { error: "Document has no extractable text." };
      return { text: result.value };
    }

    return { error: `"${fileName}" isn't a supported type for text extraction (PDF/DOCX only).` };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : `Couldn't extract text from "${fileName}".`,
    };
  }
}
