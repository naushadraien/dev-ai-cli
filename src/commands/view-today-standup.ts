import fs from "fs/promises";

/**
 * View today's standup from the specified file.
 * @param {string} filePath - Path to the standup file
 * @returns {Promise<string>}
 * @example
 * await viewTodayStandup("./standups.txt");
 */
export const viewTodayStandup = async (filePath: string): Promise<string> => {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Get today's date in the format used in the file
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const datePattern = `${day}/${month}/${year}`;

    // Find today's section
    const lines = content.split("\n");
    let todayStandup = "";
    let capturing = false;

    for (const line of lines) {
      if (line.includes(datePattern)) {
        capturing = true;
        todayStandup += line + "\n";
      } else if (capturing) {
        // Stop if we hit another date section
        if (line.match(/^Updates \[\d{2}\/\d{2}\/\d{4}/)) {
          break;
        }
        todayStandup += line + "\n";
      }
    }

    return todayStandup;
  } catch (error) {
    console.error("Failed to read standup file:", error);
    return "";
  }
};
