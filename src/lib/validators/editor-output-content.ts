import type { OutputData } from "@editorjs/editorjs";

/**
 * Safely converts any content to OutputData format
 * Handles null, undefined, malformed JSON, etc.
 */
export function safeParseEditorContent(content: any): OutputData {
  // Handle null/undefined
  if (!content) {
    return { blocks: [], version: "2.28.2", time: Date.now() };
  }

  // If it's already a proper OutputData object
  if (typeof content === "object" && Array.isArray(content.blocks)) {
    return content as OutputData;
  }

  // If it's a JSON string, try to parse it
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && Array.isArray(parsed.blocks)) {
        return parsed as OutputData;
      }
    } catch (error) {
      console.warn("Failed to parse editor content:", error);
    }
  }

  // Fallback: empty content
  console.warn("Invalid editor content format, returning empty content");
  return { blocks: [], version: "2.28.2", time: Date.now() };
}

/**
 * Type guard to check if content is valid OutputData
 */
export function isValidOutputData(content: any): content is OutputData {
  return (
    content &&
    typeof content === "object" &&
    Array.isArray(content.blocks) &&
    content.blocks.every(
      (block: any) =>
        block && typeof block === "object" && typeof block.type === "string"
    )
  );
}
