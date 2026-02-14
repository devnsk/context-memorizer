"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressCommand = compressCommand;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const context_1 = require("../core/context");
const git_1 = require("../core/git");
const ai_1 = require("../core/ai");
async function compressCommand(options) {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        const branch = await (0, git_1.getCurrentBranch)();
        const entries = await (0, context_1.loadBranchContext)(branch);
        if (entries.length <= 2) {
            console.log(chalk_1.default.yellow("⚠ Not enough context to compress (need at least 3 entries)."));
            return;
        }
        console.log(chalk_1.default.gray(`  Compressing ${entries.length} entries for branch: ${branch}...`));
        // Keep the most recent entry intact, compress older ones
        const toCompress = entries.slice(0, -1);
        const latest = entries[entries.length - 1];
        const prompt = `You are a developer assistant. Compress the following ${toCompress.length} coding session entries into a single summary entry. Keep only the most important information: key decisions, approaches that worked or failed, and overall progress.

Sessions to compress:
${toCompress
            .map((e, i) => `
Session ${i + 1} (${e.timestamp}):
- Task: ${e.task}
- Approaches: ${e.approaches.join(", ") || "none"}
- Decisions: ${e.decisions.join(", ") || "none"}
- State: ${e.currentState}
- Next steps: ${e.nextSteps.join(", ") || "none"}
`)
            .join("\n")}

Generate a JSON response:
{
  "task": "overall task description covering all sessions",
  "approaches": ["significant approaches tried"],
  "decisions": ["key decisions made across all sessions"],
  "currentState": "where things stood after these sessions",
  "nextSteps": ["remaining next steps"]
}

Be concise but preserve important decisions and learnings.`;
        const result = await (0, ai_1.callAI)([
            {
                role: "system",
                content: "You are a helpful assistant. Always respond with valid JSON.",
            },
            { role: "user", content: prompt },
        ]);
        if (result.error) {
            console.log(chalk_1.default.red(`✗ ${result.error}`));
            return;
        }
        let parsed;
        try {
            const jsonMatch = result.content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                [null, result.content];
            parsed = JSON.parse(jsonMatch[1].trim());
        }
        catch {
            console.log(chalk_1.default.red("✗ Could not parse AI compression result."));
            return;
        }
        // Create compressed entry from the oldest entry's metadata
        const compressed = {
            ...toCompress[0],
            task: parsed.task || toCompress[0].task,
            approaches: parsed.approaches || [],
            decisions: parsed.decisions || [],
            currentState: parsed.currentState || "",
            nextSteps: parsed.nextSteps || [],
            timestamp: toCompress[0].timestamp, // keep oldest timestamp
        };
        // Replace branch file with compressed + latest
        const dir = await (0, context_1.getDevCtxDir)();
        const branchFile = path_1.default.join(dir, "branches", `${branch.replace(/\//g, "__")}.json`);
        const newEntries = [compressed, latest];
        fs_1.default.writeFileSync(branchFile, JSON.stringify(newEntries, null, 2));
        console.log(chalk_1.default.green(`✓ Compressed ${entries.length} entries → 2 entries for branch: ${chalk_1.default.bold(branch)}`));
        console.log(chalk_1.default.gray(`  Kept: 1 compressed summary + latest entry`));
        console.log(chalk_1.default.cyan(`  Summary: ${parsed.task}`));
        console.log();
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
