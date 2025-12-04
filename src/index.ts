import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { defaultCommand } from "./commands/default";
import { formatStandup } from "./commands/standup-formatter";

const program = new Command();

program
  .name("devai")
  .description("Local AI Dev Assistant CLI")
  .version("1.0.0");

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

program
  .command("formatStandup")
  .argument("<data...>", "Standup data to format")
  .description("Format the provided standup")
  .action(async (data) => {
    const text = data.join(" ");
    const spinner = ora("🤖 AI is formatting your standup...").start();
    try {
      const result = await formatStandup(text);
      spinner.succeed("Standup formatted!");
      console.log(chalk.cyan(result));
    } catch (error) {
      spinner.fail("Failed to format standup!");
      console.error(chalk.red(error));
    }
  });

program.parse();
