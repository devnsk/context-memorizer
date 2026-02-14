# devctx 🧠

> Git tracks your code history. DevContext tracks your intent history.

**Persistent AI coding context for teams.** Never re-explain your codebase to an AI assistant again.

## The Problem

You're deep in a Cursor/Claude Code session. The AI knows everything — your architecture, what you tried, what failed. Then the session dies. New editor, new day, new AI — and you spend 15 minutes re-explaining everything.

**DevContext fixes this.**

## Install

```bash
npm install -g devctx
```

## Quick Start

```bash
# Initialize in your repo
devctx init

# Save context after a coding session
devctx save
# → Interactive prompts: what you worked on, what you tried, where you left off

# Or quick save with a message
devctx save "Got gRPC unary calls working, need streaming next"

# Resume in ANY editor — copies context to clipboard
devctx resume

# Paste into Cursor, Claude Code, Copilot — AI picks up where you left off ✨
```

## Commands

| Command | Description |
|---------|-------------|
| `devctx init` | Initialize in current repo |
| `devctx save [msg]` | Save coding context (interactive or quick) |
| `devctx resume` | Copy context prompt to clipboard |
| `devctx resume --branch feature/x` | Resume a specific branch |
| `devctx resume --stdout` | Print instead of copy |
| `devctx log` | View context history |
| `devctx log --all` | View all branches |

## How It Works

DevContext creates a `.devctx/` folder in your repo that stores structured context entries — what you're building, what you tried, key decisions, and where you left off. When you run `devctx resume`, it generates an AI-ready prompt and copies it to your clipboard.

Works with **every AI coding tool**: Cursor, Claude Code, GitHub Copilot, Windsurf, or even ChatGPT.

## License

MIT
