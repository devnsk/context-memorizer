"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeCommand = summarizeCommand;
const chalk_1 = __importDefault(require("chalk"));
const uuid_1 = require("uuid");
const context_1 = require("../core/context");
const git_1 = require("../core/git");
const ai_1 = require("../core/ai");
const simple_git_1 = __importDefault(require("simple-git"));
const git = (0, simple_git_1.default)();
async function summarizeCommand() {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        console.log(chalk_1.default.gray("  Analyzing git changes..."));
        const [branch, repo, filesChanged, filesStaged, recentCommits, author] = await Promise.all([
            (0, git_1.getCurrentBranch)(),
            (0, git_1.getRepoName)(),
            (0, git_1.getChangedFiles)(),
            (0, git_1.getStagedFiles)(),
            (0, git_1.getRecentCommits)(10),
            (0, git_1.getAuthor)(),
        ]);
        // Get git diff for context
        let diffSummary = "";
        try {
            const diff = await git.diff(["--stat"]);
            diffSummary = diff.slice(0, 2000); // cap at 2k chars
        }
        catch {
            diffSummary = "No diff available";
        }
        const prompt = `You are a developer assistant. Based on the following git activity, generate a concise coding context summary.

Repository: ${repo}
Branch: ${branch}
Author: ${author}

Recent commits:
${recentCommits.map((c) => `- ${c}`).join("\n")}

Files changed: ${filesChanged.join(", ") || "none"}
Files staged: ${filesStaged.join(", ") || "none"}

Diff summary:
${diffSummary}

Generate a JSON response with:
{
  "task": "one-line description of what's being worked on",
  "approaches": ["approach 1", "approach 2"],
  "decisions": ["decision 1"],
  "currentState": "where things currently stand",
  "nextSteps": ["step 1", "step 2"]
}

Be concise. Only include approaches/decisions if they're clearly evident from the commits and changes.`;
        console.log(chalk_1.default.gray("  Generating AI summary..."));
        const result = await (0, ai_1.callAI)([
            { role: "system", content: "You are a helpful developer assistant. Always respond with valid JSON." },
            { role: "user", content: prompt },
        ]);
        if (result.error) {
            console.log(chalk_1.default.red(`✗ ${result.error}`));
            return;
        }
        // Parse AI response
        let parsed;
        try {
            // Extract JSON from potential markdown code blocks
            const jsonMatch = result.content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                [null, result.content];
            parsed = JSON.parse(jsonMatch[1].trim());
        }
        catch {
            console.log(chalk_1.default.yellow("⚠ Could not parse AI response. Saving raw summary."));
            parsed = {
                task: result.content.slice(0, 200),
                approaches: [],
                decisions: [],
                currentState: result.content,
                nextSteps: [],
            };
        }
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            branch,
            repo,
            author,
            task: parsed.task || "AI-generated summary",
            approaches: parsed.approaches || [],
            decisions: parsed.decisions || [],
            currentState: parsed.currentState || "",
            nextSteps: parsed.nextSteps || [],
            filesChanged,
            filesStaged,
            recentCommits,
        };
        await (0, context_1.saveContext)(entry);
        console.log(chalk_1.default.green(`\n✓ AI-generated context saved for branch: ${chalk_1.default.bold(branch)}`));
        console.log(chalk_1.default.cyan(`\n  Task: ${entry.task}`));
        if (entry.currentState) {
            console.log(chalk_1.default.gray(`  State: ${entry.currentState}`));
        }
        if (entry.decisions.length > 0) {
            entry.decisions.forEach((d) => console.log(chalk_1.default.gray(`  Decision: ${d}`)));
        }
        if (entry.nextSteps.length > 0) {
            console.log(chalk_1.default.gray(`  Next steps: ${entry.nextSteps.join(", ")}`));
        }
        console.log();
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
