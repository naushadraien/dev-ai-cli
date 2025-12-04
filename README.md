# devai - Local AI Dev Assistant CLI

A powerful command-line AI assistant powered by Google Gemini for developers.

## Features

- 🤖 Ask AI any coding or development question
- 📝 Format standup notes automatically
- 📁 Save output to files
- 🔊 Text-to-speech voice output
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

### Format standup notes

```bash
# Basic usage
devai formatStandup "worked on lockgate feature, added CSS styling, fixed auth bug"

# Save to file (appends if file exists)
devai formatStandup "fixed login bug, added validation" -o "C:\Users\YourName\Desktop\job.txt"

# With voice output
devai formatStandup "huntgate: fixed ui issue" -v

# With both file output and voice
devai formatStandup "fixed bugs, added features" -o "./standup.txt" -v
```

## Commands

| Command | Description |
|---------|-------------|
| `devai <query>` | Ask AI any development question |
| `devai ask <query>` | Same as above (explicit) |
| `devai formatStandup <data>` | Format your standup notes |
| `devai --help` | Show help information |
| `devai --version` | Show version number |

## Options

### Global Options

| Option | Description |
|--------|-------------|
| `-v, --voice` | Speak the AI response using text-to-speech |
| `-h, --help` | Display help for command |

### formatStandup Options

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output file path to append the standup |
| `-v, --voice` | Speak the AI response using text-to-speech |

## Examples

```bash
# Ask AI a question
devai "how to center a div in css"

# Ask with voice response
devai "explain async await in javascript" -v

# Format standup and save to Desktop
devai formatStandup "huntgate: fixed ui, lockgate: added css" -o "C:\Users\irsha\OneDrive\Desktop\Job.txt"

# Format standup with voice
devai formatStandup "completed auth module, started dashboard" -v

# Format standup with file output and voice
devai formatStandup "fixed bugs in production" -o "./job.txt" --voice
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

## License

MIT