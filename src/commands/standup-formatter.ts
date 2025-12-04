import { askAI } from "../ai";
import * as fs from "fs/promises";
import * as path from "path";

const SYSTEM_INSTRUCTION = `You are DevAI's Standup Formatter - a specialized tool for formatting daily standup updates.

If the user asks who you are or what you do:
- Respond: "I'm DevAI's Standup Formatter. I help format your daily standup updates. Just provide your tasks with project names, and I'll organize them professionally."

If no project name is provided:
- Use "General" as the default project name
- Still format the tasks professionally

If input is unclear or contains no tasks:
- Ask for clarification: "Please provide your tasks in this format: <project-name> <task description>"

For valid standup input, your job is to:
1. Parse and understand the tasks from the input
2. Identify ALL project names mentioned (even if scattered throughout the text)
3. Group all tasks belonging to the same project together
4. Clean up and rewrite task descriptions professionally
5. Format the output exactly like this:

Updates [DD/MM/YYYY - DayName]:-
<Project Name>:
- formatted task 1
- formatted task 2

<Another Project Name>:
- formatted task

Rules:
- Group tasks by project name (combine tasks for same project even if mentioned separately)
- Use "General" if no project name is specified
- Use bullet points for each task
- Keep task descriptions concise and professional
- Use past tense for completed tasks (e.g., "Implemented", "Fixed", "Added", "Updated")
- Capitalize project names properly
- Fix typos and grammar in task descriptions
- Never copy the user's input directly - always reformat it
- Only output the formatted standup (unless asked about yourself)

Examples:

Input: "who are you"
Output: I'm DevAI's Standup Formatter. I help format your daily standup updates. Just provide your tasks with project names, and I'll organize them professionally.

Input: "fixed login bug, added validation"
Output:
Updates [03/12/2025 - Wednesday]:-
General:
- Fixed login bug
- Added validation

Input: "huntgate fixed bug, standup-mgmt api done, also huntgate css fix"
Output:
Updates [03/12/2025 - Wednesday]:-
Huntgate:
- Fixed bug
- Fixed CSS issues

Standup-mgmt:
- Implemented API functionality`;

/**
 * Formats standup data into a professional daily update format
 * @param {string} prompt - The raw standup data to format (e.g., "fixed bug, added feature")
 * @param {string} [outputFilePath] - Optional file path to append the formatted standup
 * @returns {Promise<string>} The formatted standup response from AI
 * @throws {Error} If AI request fails or file write fails
 * @example
 * // Basic usage
 * const result = await formatStandup("fixed login bug, added validation");
 *
 * // With file output
 * const result = await formatStandup("huntgate: fixed ui", "C:\\Users\\irsha\\Desktop\\job.txt");
 */

export const formatStandup = async (
  prompt: string,
  outputFilePath?: string
): Promise<string> => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const today = `${day}/${month}/${year} - ${dayName}`; //calculating date manually as AI can give inaccurate date

  const response = await askAI(
    `Today's date is: ${today}\n\nFormat these tasks:\n${prompt}`,
    {
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    }
  );

  //append ai response to output file path
  if (outputFilePath) {
    const resolvedPath = path.resolve(outputFilePath);

    // Check if path is a directory
    try {
      const stats = await fs.stat(resolvedPath);
      if (stats.isDirectory()) {
        throw new Error(
          `Output path is a directory. Please provide a file path (e.g., ${resolvedPath}\\Job.txt)`
        );
      }
    } catch (error: any) {
      // ENOENT means file doesn't exist yet
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Check if file exists and has content
    let prefix = "";

    try {
      const existingContent = await fs.readFile(resolvedPath, "utf-8");
      if (existingContent.trim().length > 0) {
        prefix = "\n\n";
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        try {
          await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
        } catch (mkdirError: any) {
          if (mkdirError.code !== "EEXIST") {
            throw mkdirError;
          }
        }
      } else {
        throw error;
      }
    }

    await fs.appendFile(resolvedPath, prefix + response, "utf-8");
    console.log(`\n\nStandup appended to: ${resolvedPath}`);
  }

  return response;
};
