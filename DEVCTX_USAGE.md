# DevContext (devctx) - Usage Guide

> Persistent AI coding context for teams. Never re-explain your codebase to an AI assistant again.

## Installation

Install globally or use with `npx`:

```bash
# Global install
npm install -g devctx

# Or use with npx (recommended if not in PATH)
npx devctx [command]
```

## Quick Start

### 1. Initialize Your Repository

```bash
cd your-project
npx devctx init
```

This creates a `.devctx/` folder to store your context history.

### 2. Save Context After Work

After completing a coding task, save your context:

```bash
# Quick save with message
npx devctx save "Fixed payment processing bug"

# Interactive save (asks for details)
npx devctx save
```

**Interactive prompts:**
- **Task**: What are you working on?
- **Approaches**: What solutions did you try?
- **Decisions**: What did you decide and why?
- **Next Steps**: What's left to do?
- **Blockers**: Any issues blocking progress?

### 3. Resume Context Later

When you return to work (or pass to a teammate):

```bash
npx devctx resume
```

This generates a formatted prompt and **copies it to your clipboard**. Paste it into:
- **Cursor**
- **Claude Code / Windsurf**
- **ChatGPT**
- **Any AI assistant**

The AI will now have full context of your work!

---

## Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize DevContext in repo | `npx devctx init` |
| `save [msg]` | Save current context | `npx devctx save "Completed feature X"` |
| `resume` | Generate prompt & copy to clipboard | `npx devctx resume` |
| `log` | View context history | `npx devctx log` |
| `diff` | Show changes since last save | `npx devctx diff` |

## Team Features

### Hand off to Teammate

```bash
npx devctx handoff @alice "Continue refactoring the payment service"
```

### Share Context via Git

```bash
# Commit .devctx/ folder to git for team sync
npx devctx share

# Stop sharing (add back to .gitignore)
npx devctx share --stop
```

### View All History

```bash
# Show all saved contexts
npx devctx log --all

# Show last 20 entries (default: 10)
npx devctx log -n 20
```

### Resume from Specific Branch

```bash
npx devctx resume --branch feature/payment-refactor
```

---

## Auto-Capture Features

### Watch for Changes & Auto-Save

```bash
# Auto-save every 5 minutes
npx devctx watch --interval 5

# Default is 5 minutes
npx devctx watch
```

### Install Git Post-Commit Hook

Automatically capture context after git commits:

```bash
npx devctx hook install

# Remove hook
npx devctx hook remove
```

---

## Configuration

### View Current Settings

```bash
npx devctx config list
```

### Set AI Provider

For AI-powered commands (`summarize`, `suggest`, `compress`):

```bash
npx devctx config set aiProvider "openai"
npx devctx config set aiApiKey "sk-..."
```

### Other Settings

```bash
npx devctx config set watchInterval 10
npx devctx config set autoShare true
```

---

## Advanced Features

### AI-Powered Commands (Requires API Key)

#### Generate Summary from Git

```bash
# AI analyzes git diff + commits and generates context
npx devctx summarize
```

#### Get Next Step Suggestions

```bash
# AI suggests what to do next based on current context
npx devctx suggest
```

#### Compress Old Context

```bash
# AI compresses detailed history into concise summary
npx devctx compress
```

### MCP Server Integration (Claude, Windsurf)

Enable native context access in your AI tool:

**Add to `.mcp.json` or Windsurf config:**

```json
{
  "mcpServers": {
    "devctx": {
      "command": "npx",
      "args": ["-y", "devctx", "mcp"]
    }
  }
}
```

This exposes tools:
- `devctx_save` - Save context programmatically
- `devctx_resume` - Get current context
- `devctx_log` - View history
- `devctx://context` - Access context as resource

---

## Real-World Workflow Example

### Day 1: Start Feature

```bash
cd my-project
npx devctx init
npx devctx save "Starting payment service refactoring - analyzed current architecture"
```

### Day 1: End of Day

```bash
# After 4 hours of work
npx devctx save "Extracted payment logic into separate module, wrote tests"
```

### Day 2: Continue Work

```bash
npx devctx resume
# Copy prompt and paste into Cursor
# AI now knows: architecture, what I did yesterday, next steps
```

### Handoff to Teammate

```bash
npx devctx handoff @bob "Continue integration tests for payment module"
npx devctx share  # Commits context to git
```

### Teammate Resumes

```bash
npx devctx resume
# Has full context: what was done, architecture, blockers, next steps
```

---

## Context File Structure

After running `npx devctx init`, you'll have:

```
your-project/
├── .devctx/
│   ├── index.json          # Metadata
│   ├── contexts/
│   │   ├── main-1707.json  # Context entries
│   │   └── main-1708.json
│   └── config.json         # User settings
```

**Git-safe**: Add `.devctx/` to `.gitignore` by default (unless you `npx devctx share`).

---

## Tips & Best Practices

### ✅ Do's

- **Save regularly** - After completing a feature, fix, or investigation
- **Use clear messages** - Helps you remember context later
- **Share with team** - Run `npx devctx share` to sync team context
- **Resume before AI sessions** - Always paste context into your AI tool first
- **Include blockers** - Note anything preventing progress

### ❌ Don'ts

- Don't save passwords/API keys in context
- Don't commit `.devctx/` unless using `npx devctx share`
- Don't share context across unrelated projects
- Avoid saving during merge conflicts

---

## Troubleshooting

### Command Not Found

If `devctx` command isn't recognized:

```bash
# Use npx instead
npx devctx [command]
```

### No Context Saved

Initialize first:
```bash
npx devctx init
```

### Can't Copy to Clipboard

Use `--stdout` flag:
```bash
npx devctx resume --stdout
```

### Need Help

View all commands:
```bash
npx devctx --help
npx devctx [command] --help
```

---

## Environment Variables

```bash
# Set AI provider API key
export DEVCTX_AI_KEY="sk-..."

# Set custom API endpoint
export DEVCTX_AI_API_URL="https://api.openai.com/v1"

# Use custom watch interval (minutes)
export DEVCTX_WATCH_INTERVAL=10
```

---

## FAQ

**Q: Is my context private?**
> By default, `.devctx/` is gitignored (private). Only share via `npx devctx share`.

**Q: Can I use this with multiple projects?**
> Yes! Each project has its own `.devctx/` folder.

**Q: Does this work offline?**
> Yes! Core commands (`save`, `resume`, `log`) work 100% offline.

**Q: What about AI commands (summarize, suggest)?**
> Require an LLM API key (OpenAI-compatible). Set via config or env var.

**Q: Can I export my context?**
> Context is stored as JSON in `.devctx/contexts/`. You can read/backup directly.

---

## Resources

- **GitHub**: https://github.com/devnsk/context-memorizer
- **NPM**: https://www.npmjs.com/package/devctx
- **Issues**: https://github.com/devnsk/context-memorizer/issues

---

Happy coding! 🚀
