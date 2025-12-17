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
 * Gets today's date in DD/MM/YYYY format
 * @returns {string} Today's date string
 */
const getTodayDateString = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Gets today's full date with day name
 * @returns {string} Today's date with day name (e.g., "17/12/2025 - Wednesday")
 */
const getTodayWithDayName = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}/${month}/${year} - ${dayName}`;
};

/**
 * Parses standup content into a structured format
 * @param {string} content - Raw standup content
 * @returns {Map<string, Map<string, string[]>>} Map of date -> project -> tasks
 */
const parseStandupContent = (
  content: string
): Map<string, Map<string, string[]>> => {
  const standups = new Map<string, Map<string, string[]>>();

  if (!content.trim()) return standups;

  const lines = content.split("\n");
  let currentDate = "";
  let currentProject = "";

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Match date header: "Updates [DD/MM/YYYY - DayName]:-"
    const dateMatch = trimmedLine.match(/^Updates \[(.+)\]:-?$/);
    if (dateMatch) {
      currentDate = dateMatch[1] ?? "";
      if (!standups.has(currentDate)) {
        standups.set(currentDate, new Map<string, string[]>());
      }
      currentProject = "";
      continue;
    }

    // Match project name: "ProjectName:" (line ending with colon, not a task)
    const projectMatch = trimmedLine.match(/^([^-].+):$/);
    if (projectMatch && currentDate) {
      currentProject = (projectMatch?.[1] ?? "").trim();
      const dateProjects = standups.get(currentDate)!;
      if (!dateProjects.has(currentProject)) {
        dateProjects.set(currentProject, []);
      }
      continue;
    }

    // Match task: "- task description"
    const taskMatch = trimmedLine.match(/^-\s+(.+)$/);
    if (taskMatch && currentDate && currentProject) {
      const task = (taskMatch?.[1] ?? "").trim();
      const dateProjects = standups.get(currentDate)!;
      const tasks = dateProjects.get(currentProject)!;
      // Avoid duplicate tasks
      if (!tasks.includes(task)) {
        tasks.push(task);
      }
    }
  }

  return standups;
};

/**
 * Converts structured standup data back to formatted string
 * @param {Map<string, Map<string, string[]>>} standups - Structured standup data
 * @returns {string} Formatted standup string
 */
const formatStandupContent = (
  standups: Map<string, Map<string, string[]>>
): string => {
  const parts: string[] = [];

  for (const [date, projects] of standups) {
    const dateParts: string[] = [`Updates [${date}]:-`];

    for (const [project, tasks] of projects) {
      dateParts.push(`${project}:`);
      for (const task of tasks) {
        dateParts.push(`- ${task}`);
      }
      dateParts.push(""); // Empty line between projects
    }

    parts.push(dateParts.join("\n").trim());
  }

  return parts.join("\n\n");
};

/**
 * Merges new standup response with existing content
 * @param {string} existingContent - Existing file content
 * @param {string} newResponse - New AI response
 * @returns {string} Merged content
 */
const mergeStandups = (
  existingContent: string,
  newResponse: string
): string => {
  const existingStandups = parseStandupContent(existingContent);
  const newStandups = parseStandupContent(newResponse);

  // Merge new standups into existing
  for (const [date, newProjects] of newStandups) {
    if (!existingStandups.has(date)) {
      existingStandups.set(date, new Map<string, string[]>());
    }

    const existingProjects = existingStandups.get(date)!;

    for (const [project, newTasks] of newProjects) {
      if (!existingProjects.has(project)) {
        existingProjects.set(project, []);
      }

      const existingTasks = existingProjects.get(project)!;

      // Add new tasks (avoid duplicates)
      for (const task of newTasks) {
        if (!existingTasks.includes(task)) {
          existingTasks.push(task);
        }
      }
    }
  }

  return formatStandupContent(existingStandups);
};

/**
 * Gets today's standup from file content
 * @param {string} content - File content
 * @returns {string | null} Today's standup or null if not found
 */
const getTodayStandup = (content: string): string | null => {
  const todayDate = getTodayDateString();
  const standups = parseStandupContent(content);

  // Find today's standup (date contains todayDate)
  for (const [date, projects] of standups) {
    if (date.includes(todayDate)) {
      const singleDayMap = new Map<string, Map<string, string[]>>();
      singleDayMap.set(date, projects);
      return formatStandupContent(singleDayMap);
    }
  }

  return null;
};

/**
 * Options for formatStandup function
 */
export interface FormatStandupOptions {
  /** Output file path to save the standup */
  outputFilePath?: string;
  /** Whether to return all of today's standups from file */
  showAll?: boolean;
}

/**
 * Result of formatStandup function
 */
export interface FormatStandupResult {
  /** The latest AI response (newly formatted standup) */
  latestResponse: string;
  /** All of today's standups (if showAll is true and file exists) */
  todayStandup?: string | null;
}

/**
 * Formats standup data into a professional daily update format
 * @param {string} prompt - The raw standup data to format (e.g., "fixed bug, added feature")
 * @param {FormatStandupOptions} [options] - Options for formatting
 * @returns {Promise<FormatStandupResult>} The formatted standup response from AI
 * @throws {Error} If AI request fails or file write fails
 * @example
 * // Basic usage
 * const result = await formatStandup("fixed login bug, added validation");
 *
 * // With file output
 * const result = await formatStandup("huntgate: fixed ui", { outputFilePath: "C:\\job.txt" });
 *
 * // With file output and show all today's standups
 * const result = await formatStandup("huntgate: fixed ui", { outputFilePath: "C:\\job.txt", showAll: true });
 */
export const formatStandup = async (
  prompt: string,
  options?: FormatStandupOptions
): Promise<FormatStandupResult> => {
  const today = getTodayWithDayName();
  const { outputFilePath, showAll } = options || {};

  const response = await askAI(
    `Today's date is: ${today}\n\nFormat these tasks:\n${prompt}`,
    {
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    }
  );

  const result: FormatStandupResult = {
    latestResponse: response,
  };

  // Append AI response to output file path
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
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Read existing content
    let existingContent = "";
    let fileExists = false;

    try {
      existingContent = await fs.readFile(resolvedPath, "utf-8");
      fileExists = true;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // File doesn't exist, create directory if needed
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

    let finalContent: string;

    if (fileExists && existingContent.trim().length > 0) {
      // Merge with existing content
      finalContent = mergeStandups(existingContent, response);
    } else {
      // New file
      finalContent = response;
    }

    await fs.writeFile(resolvedPath, finalContent, "utf-8");

    // If showAll is true, get today's complete standup from the merged file
    if (showAll) {
      result.todayStandup = getTodayStandup(finalContent);
    }
  }

  return result;
};
