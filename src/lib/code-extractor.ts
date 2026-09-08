/**
 * Extracts executable React component code from an AI response stream.
 * Handles both complete and in-progress code fences (e.g. during streaming).
 */
export function extractCodeFromStream(text: string): { code: string | null; isCodeFenceDetected: boolean } {
  if (!text) {
    return { code: null, isCodeFenceDetected: false };
  }

  // Regex to match code blocks with jsx, tsx, javascript, or generic code
  const codeBlockRegex = /```(?:jsx|tsx|javascript|js|react)?\s*([\s\S]*?)(?:```|$)/i;
  const match = text.match(codeBlockRegex);

  if (match && match[1]) {
    const rawCode = match[1].trim();
    if (rawCode.length > 0) {
      return {
        code: rawCode,
        isCodeFenceDetected: true,
      };
    }
  }

  // Fallback: If the text directly starts with imports or export default function App
  if (text.includes('export default function') || text.includes('import React')) {
    return {
      code: text.trim(),
      isCodeFenceDetected: false,
    };
  }

  return { code: null, isCodeFenceDetected: false };
}

/**
 * Strips code fences from a final assistant response to display clean commentary
 * in chat bubbles while the code resides in the editor/preview.
 */
export function extractCommentaryFromResponse(text: string): string {
  if (!text) return '';
  // Remove markdown code blocks
  const cleaned = text.replace(/```(?:jsx|tsx|javascript|js|react)?[\s\S]*?```/gi, '').trim();
  return cleaned || 'Component generated successfully!';
}
