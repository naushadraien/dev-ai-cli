import { askAI } from "../ai";

const SYSTEM_INSTRUCTION = `You are DevAI, a CLI-based coding assistant.

Rules:
- Keep responses terminal-friendly (no long paragraphs)
- Use bullet points for lists
- Show code in clean blocks
- Be direct and skip pleasantries
- Prioritize working solutions over theory
- Include commands when relevant (npm, git, bun, etc.)
- Mention file paths when suggesting code changes`;

/**
 * Returns ai response to any question
 * @param {string} prompt - The raw prompt (e.g., "Hi, how are you?")
 * @returns {Promise<string>} The formatted standup response from AI
 * @example
 * // Basic usage
 * const result = await defaultCommand("Hi, how are you?");
 */
export const defaultCommand = async (prompt: string): Promise<string> => {
  return await askAI(prompt, {
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};
