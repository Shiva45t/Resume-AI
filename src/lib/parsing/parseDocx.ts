import mammoth from "mammoth";

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value ? result.value.trim() : "";
    if (!text) {
      throw new Error("No readable text found in DOCX file.");
    }
    return text;
  } catch (error: any) {
    console.error("DOCX parsing error:", error);
    throw new Error(`DOCX parsing failed: ${error?.message || "Unknown error"}`);
  }
}
