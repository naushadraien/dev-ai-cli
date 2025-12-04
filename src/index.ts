import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { defaultCommand } from "./commands/default";
import { formatStandup } from "./commands/standup-formatter";

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
 * @example
 * devai "how to center a div in css"
 * devai explain async await in javascript
 */
program.argument("<query...>", "Ask AI anything").action(async (query) => {
  const text = query.join(" ");
  const spinner = ora("🤖 AI is thinking...").start();
  try {
    const result = await defaultCommand(text);
    spinner.succeed("Done!");
    console.log(chalk.green(result));
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
 * @example
 * // Without file output
 * devai formatStandup "fixed login bug, added validation"
 *
 * // With file output (appends to file)
 * devai formatStandup "huntgate: fixed ui issue" -o "C:\Users\irsha\Desktop\job.txt"
 *
 * // Using --output flag
 * devai formatStandup "standup-mgmt: explored figma" --output "./job.txt"
 */
program
  .command("formatStandup")
  .argument("<data...>", "Standup data to format")
  .option("-o, --output <path>", "Output file path to append the standup")
  .description("Format the provided standup")
  .action(async (data, options) => {
    const text = data.join(" ");
    const spinner = ora("🤖 AI is formatting your standup...").start();
    try {
      const result = await formatStandup(text, options.output);
      spinner.succeed("Standup formatted!");
      console.log(chalk.cyan(result));
    } catch (error) {
      spinner.fail("Failed to format standup!");
      console.error(chalk.red(error));
    }
  });

program.parse();
