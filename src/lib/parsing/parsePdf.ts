import { extractText } from "unpdf";

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text } = await extractText(uint8Array);
    const extractedText = Array.isArray(text) ? text.join("\n") : text || "";
    
    const trimmed = extractedText.trim();
    if (!trimmed) {
      throw new Error("No readable text found in PDF file.");
    }
    return trimmed;
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    throw new Error(`PDF parsing failed: ${error?.message || "Unknown error"}`);
  }
}
