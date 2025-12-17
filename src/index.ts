import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { defaultCommand } from "./commands/default";
import { formatStandup } from "./commands/standup-formatter";
import { speak } from "./util/speak-with-powershell";

/* 
you can run any of the below command in the powershell if the devai command does not work:
& "C:\Users\irsha\.bun\bin\dev.exe" formatStandup "added css in lockgate, huntgate: fixed ui issue, standup-mgmt: explored figma design" 
*/

/**
 * DevAI CLI - A local AI-powered developer assistant
 * @description Command-line interface for interacting with AI for various development tasks
 */
const program = new Command();

program
  .name("devai")
  .description("Local AI Dev Assistant CLI")
  .version("1.0.0");

/**
 * Default command - Ask AI anything
 * @param {string[]} query - The query to ask the AI (joined with spaces)
 * @param {Object} options - Command options
 * @param {boolean} [options.voice] - Optional flag to speak the response
 * @example
 * devai "how to center a div in css"
 * devai "explain async await" -v
 * devai "what is typescript" --voice
 *
 * // Ask AI (default command) - both work the same
 * devai ask "what is typescript" -v
 * devai "what is typescript" -v
 */
program
  .command("ask", { isDefault: true }) //{ isDefault: true } makes it run when no other command matches
  .argument("<query...>", "Ask AI anything")
  .option("-v, --voice", "Speak the AI response using text-to-speech")
  .action(async (query, options) => {
    const text = query.join(" ");
    const spinner = ora("🤖 AI is thinking...").start();
    try {
      const result = await defaultCommand(text);
      spinner.succeed("Done!");
      console.log(chalk.green(result));

      if (options.voice) {
        spinner.start("🔊 Speaking...");
        await speak(result);
        spinner.succeed("Done speaking!");
      }
    } catch (error) {
      spinner.fail("Something went wrong!");
      console.error(chalk.red(error));
    }
  });

/**
 * Format Standup command - Formats daily standup updates professionally
 * @param {string[]} data - The standup data to format (joined with spaces)
 * @param {Object} options - Command options
 * @param {string} [options.output] - Optional file path to append the formatted standup
 * @param {boolean} [options.voice] - Optional flag to speak the response
 * @param {boolean} [options.all] - Optional flag to show all of today's standups from file
 * @example
 * // Without file output
 * devai formatStandup "fixed login bug, added validation"
 *
 * // With file output (appends to file)
 * devai formatStandup "huntgate: fixed ui issue" -o "C:\Users\irsha\Desktop\job.txt"
 *
 * // With voice output
 * devai formatStandup "fixed login bug" -v
 *
 * // Show all of today's standups after saving
 * devai formatStandup "fixed bug" -o "./job.txt" -a
 * devai formatStandup "fixed bug" -o "./job.txt" --all
 *
 * // With all options combined
 * devai formatStandup "fixed bug" -o "./job.txt" -a -v
 */
program
  .command("formatStandup")
  .argument("<data...>", "Standup data to format")
  .option("-o, --output <path>", "Output file path to append the standup")
  .option("-v, --voice", "Speak the AI response using text-to-speech")
  .option("-a, --all", "Show all of today's standups from file after saving")
  .description("Format the provided standup")
  .action(async (data, options) => {
    const text = data.join(" ");
    const spinner = ora("🤖 AI is formatting your standup...").start();
    try {
      const result = await formatStandup(text, {
        outputFilePath: options.output,
        showAll: options.all,
      });

      spinner.succeed("Standup formatted!");

      // Show appropriate output based on options
      if (options.all && result.todayStandup) {
        console.log(chalk.cyan("\n📋 Today's Complete Standup:\n"));
        console.log(chalk.cyan(result.todayStandup));
      } else {
        console.log(chalk.cyan(result.latestResponse));
      }

      // Voice output
      if (options.voice) {
        const textToSpeak =
          options.all && result.todayStandup
            ? result.todayStandup
            : result.latestResponse;
        spinner.start("🔊 Speaking...");
        await speak(textToSpeak);
        spinner.succeed("Done speaking!");
      }
    } catch (error) {
      spinner.fail("Failed to format standup!");
      console.error(chalk.red(error));
    }
  });

program.parse();
