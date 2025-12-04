# devai - Local AI Dev Assistant CLI

A powerful command-line AI assistant powered by Google Gemini for developers.

## Features

- 🤖 Ask AI any coding or development question
- 📝 Format standup notes automatically
- ⚡ Fast execution with Bun runtime

## Installation

### Prerequisites

- [Bun](https://bun.sh) installed
- Google Gemini API key

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
devai "How do I create a React component?"
devai "Explain async/await in JavaScript"
```

### Format standup notes

```bash
devai formatStandup "worked on lockgate feature, added CSS styling, fixed auth bug"
```

## Commands

| Command | Description |
|---------|-------------|
| `devai <query>` | Ask AI any development question |
| `devai formatStandup <data>` | Format your standup notes |
| `devai --help` | Show help information |
| `devai --version` | Show version number |

## Tech Stack

- **Runtime:** [Bun](https://bun.sh) v1.3.3
- **AI:** Google Gemini (gemini-2.5-flash)
- **CLI Framework:** [Commander.js](https://github.com/tj/commander.js)
- **Styling:** [Chalk](https://github.com/chalk/chalk)
- **Spinner:** [Ora](https://github.com/sindresorhus/ora)

## License

MIT