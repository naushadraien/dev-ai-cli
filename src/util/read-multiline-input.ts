import fs from "fs/promises";
import { edit } from "external-editor";

/**
 * Reads text from standard input (stdin).
 *
 * This function is primarily used to capture piped input,
 * such as clipboard content or file streams:
 *
 * Example:
 * - PowerShell: Get-Clipboard | devai ticketAnalyze
 * - Bash/macOS: pbpaste | devai ticketAnalyze
 *
 * If no data is piped, stdin typically ends immediately
 * and the function resolves with null.
 *
 * @returns {Promise<string | null>}
 * Resolves with trimmed stdin content if available,
 * otherwise returns null.
 */
const readStdin = async (): Promise<string | null> => {
  if (process.stdin.isTTY) {
    return null;
  }

  return new Promise((resolve) => {
    let data = "";

    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      const text = data.trim();
      resolve(text.length > 0 ? text : null);
    });

    process.stdin.on("error", () => resolve(null));
  });
};

/**
 * Reads multi-line input for CLI commands using a fallback strategy.
 *
 * Input is resolved in the following priority order:
 * 1. **Standard Input (stdin)** – when input is piped from another command
 *    (e.g., clipboard or file piping).
 * 2. **File Path Argument** – reads content from the provided file path.
 * 3. **System Editor** – opens the user's default editor for manual input.
 *
 * This approach ensures a smooth cross-platform experience
 * across Windows (PowerShell), macOS, and Linux terminals.
 *
 * @param {string} [filePath]
 * Optional file path containing the multi-line input.
 *
 * @returns {Promise<string>}
 * Resolves with the resolved multi-line input text.
 *
 * @throws {Error}
 * Throws an error if no input is provided via stdin, file, or editor.
 */
export const readMultilineInput = async (
  filePath?: string,
): Promise<string> => {
  // 1️⃣ Try stdin (clipboard / pipe)
  const stdinText = await readStdin();
  if (stdinText) {
    return stdinText;
  }

  // 2️⃣ Read from file
  if (filePath) {
    const content = await fs.readFile(filePath, "utf8");
    if (content.trim()) return content;
  }

  // 3️⃣ Open editor
  const editorContent = edit().trim();
  if (!editorContent) {
    throw new Error("Ticket description cannot be empty");
  }

  return editorContent;
};
