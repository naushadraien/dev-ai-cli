# devai - Local AI Dev Assistant CLI

A powerful command-line AI assistant powered by Google Gemini for developers.

## Features

- 🤖 Ask AI any coding or development question
- 🎫 Analyze Jira/development tickets into action plans
- 📝 Format standup notes automatically
- 📁 Save output to files (with smart merging)
- 🔊 Text-to-speech voice output
- 📋 View all of today's standups
- ⚡ Fast execution with Bun runtime

## Installation

### Prerequisites

- [Bun](https://bun.sh) installed
- Google Gemini API key
- Windows (for voice feature)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/naushadraien/dev-ai-cli.git
cd dev-ai-cli
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

4. Link the CLI globally:

```bash
bun link
```

## Usage

### Ask AI anything

```bash
# Basic usage
devai "How do I create a React component?"
devai "Explain async/await in JavaScript"

# With voice output
devai "What is TypeScript?" -v
devai "Explain promises" --voice
```

### Analyze Jira/Development Tickets

```bash
# Using clipboard (PowerShell)
Get-Clipboard | devai ticketAnalyze

# Using clipboard (macOS/Linux)
pbpaste | devai ticketAnalyze

# From a file
devai ticketAnalyze ./ticket.txt

# Opens editor for manual input if no stdin or file
devai ticketAnalyze
```

### Format standup notes

```bash
# Basic usage
devai formatStandup "worked on lockgate feature, added CSS styling, fixed auth bug"

# Save to file (appends and merges if file exists)
devai formatStandup "fixed login bug, added validation" -o "C:\Users\YourName\Desktop\job.txt"

# With voice output
devai formatStandup "huntgate: fixed ui issue" -v

# With both file output and voice
devai formatStandup "fixed bugs, added features" -o "./standup.txt" -v

# Show all of today's standups after saving
devai formatStandup "huntgate: fixed bug" -o "./job.txt" -a

# Combine all options
devai formatStandup "lockgate: added css" -o "./job.txt" -a -v
```

## Smart Standup Merging

When saving to a file, the CLI intelligently merges standups:

- **Same day, same project** → Tasks are merged under the same project
- **Same day, different project** → New project section is added
- **Different day** → New date section is created
- **Duplicate tasks** → Automatically ignored

### Example

```bash
# 9 AM - First standup
devai formatStandup "huntgate: fixed bug" -o "./Job.txt"
# File content:
# Updates [17/12/2025 - Wednesday]:-
# Huntgate:
# - Fixed bug

# 12 PM - Add more to same project
devai formatStandup "huntgate: added css" -o "./Job.txt"
# File content (merged):
# Updates [17/12/2025 - Wednesday]:-
# Huntgate:
# - Fixed bug
# - Added CSS

# 3 PM - Add different project
devai formatStandup "lockgate: api done" -o "./Job.txt" -a
# Output shows all today's standups:
# 📋 Today's Complete Standup:
#
# Updates [17/12/2025 - Wednesday]:-
# Huntgate:
# - Fixed bug
# - Added CSS
#
# Lockgate:
# - Completed API
```

## Ticket Analysis

The `ticketAnalyze` command converts development tickets into structured action plans.

### Input Methods (in priority order)

1. **Piped input** - Clipboard or file content piped via stdin
2. **File argument** - Path to a file containing the ticket
3. **Editor** - Opens system editor for manual input

### Sample Output

```
Summary:
- Add user authentication to the dashboard page

Frontend Tasks:
- Create login form component
- Add form validation
- Implement error handling UI

Backend Tasks:
- Create /auth/login endpoint
- Implement JWT token generation
- Add password hashing

Risks & Edge Cases:
- Session timeout handling
- Multiple failed login attempts
- Password reset flow not specified
```

## Commands

| Command                       | Description                               |
| ----------------------------- | ----------------------------------------- |
| `devai <query>`               | Ask AI any development question           |
| `devai ask <query>`           | Same as above (explicit)                  |
| `devai ticketAnalyze [file]`  | Analyze a ticket and generate action plan |
| `devai formatStandup <data>`  | Format your standup notes                 |
| `devai --help`                | Show help information                     |
| `devai --version`             | Show version number                       |

## Options

### Global Options

| Option        | Description                                  |
| ------------- | -------------------------------------------- |
| `-v, --voice` | Speak the AI response using text-to-speech   |
| `-h, --help`  | Display help for command                     |

### formatStandup Options

| Option               | Short | Description                                    |
| -------------------- | ----- | ---------------------------------------------- |
| `--output <path>`    | `-o`  | Output file path to save/merge the standup     |
| `--voice`            | `-v`  | Speak the AI response using text-to-speech     |
| `--all`              | `-a`  | Show all of today's standups from file         |

### ticketAnalyze Options

| Option       | Description                                          |
| ------------ | ---------------------------------------------------- |
| `[filePath]` | Optional file path containing the ticket description |

## Examples

```bash
# Ask AI a question
devai "how to center a div in css"

# Ask with voice response
devai "explain async await in javascript" -v

# Analyze ticket from clipboard (PowerShell)
Get-Clipboard | devai ticketAnalyze

# Analyze ticket from clipboard (macOS)
pbpaste | devai ticketAnalyze

# Analyze ticket from file
devai ticketAnalyze ./tickets/JIRA-123.txt

# Open editor to type/paste ticket manually
devai ticketAnalyze

# Format standup and save to Desktop
devai formatStandup "huntgate: fixed ui, lockgate: added css" -o "C:\Users\irsha\OneDrive\Desktop\Job.txt"

# Format standup with voice
devai formatStandup "completed auth module, started dashboard" -v

# Format standup with file output and voice
devai formatStandup "fixed bugs in production" -o "./job.txt" --voice

# Format and show all today's standups
devai formatStandup "huntgate: wrote tests" -o "./job.txt" -a

# Format with all options (save, show all, voice)
devai formatStandup "lockgate: deployed to staging" -o "./job.txt" -a -v
```

## Tech Stack

- **Runtime:** [Bun](https://bun.sh) v1.3.3
- **AI:** Google Gemini (gemini-2.5-flash)
- **CLI Framework:** [Commander.js](https://github.com/tj/commander.js)
- **Styling:** [Chalk](https://github.com/chalk/chalk)
- **Spinner:** [Ora](https://github.com/sindresorhus/ora)
- **Voice:** Windows Speech Synthesis (Microsoft Zira)

## Voice Configuration

The voice feature uses Windows built-in speech synthesis with the following defaults:

- **Voice:** Microsoft Zira Desktop (Female US English)
- **Rate:** -2 (slightly slower than normal)

Available voices on Windows:

- `Microsoft Zira Desktop` - Female US English
- `Microsoft David Desktop` - Male US English
- `Microsoft Mark Desktop` - Male US English

To list all available voices on your system:

```powershell
powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }"
```

## Troubleshooting

### Command not found

If `devai` command doesn't work, try running directly:

```powershell
& "C:\Users\YourName\.bun\bin\devai.exe" formatStandup "your standup data"
```

### File not saving to Desktop

Your Desktop might be synced with OneDrive. Check the actual path:

```powershell
[Environment]::GetFolderPath("Desktop")
```

Use the returned path instead (e.g., `C:\Users\YourName\OneDrive\Desktop\Job.txt`)

### Voice not working

Make sure you're running on Windows and have speech synthesis installed:

```powershell
powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Speak('Hello')"
```

## License

MIT