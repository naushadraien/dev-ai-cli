import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Speaks the given text using PowerShell's built-in speech synthesis
 * @param {string} text - The text to speak
 * @param {string} [voice] - The voice to use (default: "Microsoft Zira Desktop")
 * @param {number} [rate] - The speech rate from -10 (slowest) to 10 (fastest), default: -2
 * @returns {Promise<void>}
 * @example
 * await speak("Hello, I am DevAI!");
 * await speak("Hello!", "Microsoft David Desktop", 0);
 * await speak("Slow speech", "Microsoft Zira Desktop", -5);
 */
export const speak = async (
  text: string,
  voice: string = "Microsoft Zira Desktop",
  rate: number = -2
): Promise<void> => {
  // Escape single quotes and remove special characters that might break PowerShell
  const sanitizedText = text
    .replace(/'/g, "''")
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\w\s.,!?;:'-]/g, "");

  const command = `powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.SelectVoice('${voice}'); $speak.Rate = ${rate}; $speak.Speak('${sanitizedText}')"`;

  await execAsync(command);
};
