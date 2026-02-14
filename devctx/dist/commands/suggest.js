"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestCommand = suggestCommand;
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../core/context");
const git_1 = require("../core/git");
const ai_1 = require("../core/ai");
async function suggestCommand() {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        const branch = await (0, git_1.getCurrentBranch)();
        const entries = await (0, context_1.loadBranchContext)(branch);
        const [filesChanged, recentCommits] = await Promise.all([
            (0, git_1.getChangedFiles)(),
            (0, git_1.getRecentCommits)(10),
        ]);
        if (entries.length === 0 && filesChanged.length === 0) {
            console.log(chalk_1.default.yellow("⚠ No context or changes found. Nothing to analyze."));
            return;
        }
        console.log(chalk_1.default.gray("  Analyzing codebase and context..."));
        const latest = entries[entries.length - 1];
        const contextSummary = latest
            ? `Current task: ${latest.task}
Current state: ${latest.currentState}
Previous approaches: ${latest.approaches.join(", ") || "none"}
Previous decisions: ${latest.decisions.join(", ") || "none"}
Known blockers: ${latest.blockers?.join(", ") || "none"}
Previous next steps: ${latest.nextSteps.join(", ") || "none"}`
            : "No previous context available.";
        const prompt = `You are a senior developer mentor. Based on the following project context, suggest concrete next steps.

Branch: ${branch}

${contextSummary}

Recent commits:
${recentCommits.map((c) => `- ${c}`).join("\n")}

Currently changed files: ${filesChanged.join(", ") || "none"}

Provide 3-5 specific, actionable next steps. For each step, briefly explain WHY it's important. Format as a numbered list.`;
        const result = await (0, ai_1.callAI)([
            {
                role: "system",
                content: "You are a helpful senior developer. Be concise and actionable.",
            },
            { role: "user", content: prompt },
        ]);
        if (result.error) {
            console.log(chalk_1.default.red(`✗ ${result.error}`));
            return;
        }
        console.log(chalk_1.default.bold.cyan("\n💡 Suggested Next Steps\n"));
        console.log(result.content);
        console.log();
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
