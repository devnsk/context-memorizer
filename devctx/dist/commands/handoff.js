"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handoffCommand = handoffCommand;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const uuid_1 = require("uuid");
const context_1 = require("../core/context");
const git_1 = require("../core/git");
async function handoffCommand(assignee, message) {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        // Clean up @ prefix if present
        let targetAssignee = assignee?.replace(/^@/, "") || "";
        let handoffNote = message || "";
        if (!targetAssignee || !handoffNote) {
            const answers = await inquirer_1.default.prompt([
                ...(!targetAssignee
                    ? [
                        {
                            type: "input",
                            name: "assignee",
                            message: "Who are you handing off to?",
                            validate: (input) => input.length > 0 || "Assignee is required",
                        },
                    ]
                    : []),
                ...(!handoffNote
                    ? [
                        {
                            type: "input",
                            name: "handoffNote",
                            message: "Handoff note (what they need to know):",
                            validate: (input) => input.length > 0 || "Handoff note is required",
                        },
                    ]
                    : []),
                {
                    type: "input",
                    name: "task",
                    message: "What were you working on?",
                    validate: (input) => input.length > 0 || "Task description is required",
                },
                {
                    type: "input",
                    name: "currentState",
                    message: "Where did you leave off?",
                    validate: (input) => input.length > 0 || "Current state is required",
                },
                {
                    type: "input",
                    name: "nextSteps",
                    message: "What comes next? (comma-separated)",
                    default: "",
                },
                {
                    type: "input",
                    name: "blockers",
                    message: "Any blockers? (comma-separated)",
                    default: "",
                },
            ]);
            targetAssignee = targetAssignee || answers.assignee;
            handoffNote = handoffNote || answers.handoffNote;
            const [branch, repo, filesChanged, filesStaged, recentCommits, author] = await Promise.all([
                (0, git_1.getCurrentBranch)(),
                (0, git_1.getRepoName)(),
                (0, git_1.getChangedFiles)(),
                (0, git_1.getStagedFiles)(),
                (0, git_1.getRecentCommits)(),
                (0, git_1.getAuthor)(),
            ]);
            const entry = {
                id: (0, uuid_1.v4)(),
                timestamp: new Date().toISOString(),
                branch,
                repo,
                author,
                task: answers.task,
                approaches: [],
                decisions: [],
                currentState: answers.currentState,
                nextSteps: answers.nextSteps
                    ? answers.nextSteps
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [],
                blockers: answers.blockers
                    ? answers.blockers
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : undefined,
                filesChanged,
                filesStaged,
                recentCommits,
                assignee: targetAssignee,
                handoffNote,
            };
            await (0, context_1.saveContext)(entry);
            console.log(chalk_1.default.green(`\n✓ Handoff created for ${chalk_1.default.bold("@" + targetAssignee)}`));
            console.log(chalk_1.default.gray(`  Branch: ${branch}`));
            console.log(chalk_1.default.cyan(`\n  📝 Handoff Note:`));
            console.log(chalk_1.default.white(`  ${handoffNote}\n`));
            console.log(chalk_1.default.gray(`  They can resume with: ${chalk_1.default.white("devctx resume --branch " + branch)}`));
        }
        else {
            // Quick mode — minimal context with handoff
            const [branch, repo, filesChanged, filesStaged, recentCommits, author] = await Promise.all([
                (0, git_1.getCurrentBranch)(),
                (0, git_1.getRepoName)(),
                (0, git_1.getChangedFiles)(),
                (0, git_1.getStagedFiles)(),
                (0, git_1.getRecentCommits)(),
                (0, git_1.getAuthor)(),
            ]);
            const entry = {
                id: (0, uuid_1.v4)(),
                timestamp: new Date().toISOString(),
                branch,
                repo,
                author,
                task: `Handoff to @${targetAssignee}`,
                approaches: [],
                decisions: [],
                currentState: handoffNote,
                nextSteps: [],
                filesChanged,
                filesStaged,
                recentCommits,
                assignee: targetAssignee,
                handoffNote,
            };
            await (0, context_1.saveContext)(entry);
            console.log(chalk_1.default.green(`\n✓ Handoff created for ${chalk_1.default.bold("@" + targetAssignee)}`));
            console.log(chalk_1.default.gray(`  Branch: ${branch}`));
            console.log(chalk_1.default.cyan(`\n  📝 Handoff Note:`));
            console.log(chalk_1.default.white(`  ${handoffNote}\n`));
            console.log(chalk_1.default.gray(`  They can resume with: ${chalk_1.default.white("devctx resume --branch " + branch)}`));
        }
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
