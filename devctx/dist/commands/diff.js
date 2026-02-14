"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffCommand = diffCommand;
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../core/context");
const git_1 = require("../core/git");
function getTimeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60)
        return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}
async function diffCommand() {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        const branch = await (0, git_1.getCurrentBranch)();
        const entries = await (0, context_1.loadBranchContext)(branch);
        if (entries.length === 0) {
            console.log(chalk_1.default.yellow(`⚠ No context found for branch: ${branch}`));
            console.log(chalk_1.default.gray("  Run `devctx save` to capture context first."));
            return;
        }
        const latest = entries[entries.length - 1];
        const [currentChanged, currentStaged] = await Promise.all([
            (0, git_1.getChangedFiles)(),
            (0, git_1.getStagedFiles)(),
        ]);
        const lastSaveTime = getTimeAgo(latest.timestamp);
        console.log(chalk_1.default.bold(`\nSince last save (${lastSaveTime}):\n`));
        // --- Files ---
        const previousFiles = new Set(latest.filesChanged);
        const currentFiles = new Set([...currentChanged, ...currentStaged]);
        const newFiles = [...currentFiles].filter((f) => !previousFiles.has(f));
        const removedFiles = [...previousFiles].filter((f) => !currentFiles.has(f));
        const stillChanged = [...currentFiles].filter((f) => previousFiles.has(f));
        if (newFiles.length > 0) {
            newFiles.forEach((f) => console.log(`  ${chalk_1.default.green("+")} ${f} ${chalk_1.default.green("(new)")}`));
        }
        if (stillChanged.length > 0) {
            stillChanged.forEach((f) => console.log(`  ${chalk_1.default.yellow("~")} ${f} ${chalk_1.default.gray("(still modified)")}`));
        }
        if (removedFiles.length > 0) {
            removedFiles.forEach((f) => console.log(`  ${chalk_1.default.red("-")} ${f} ${chalk_1.default.gray("(resolved)")}`));
        }
        if (newFiles.length === 0 && removedFiles.length === 0 && stillChanged.length === 0) {
            console.log(chalk_1.default.gray("  No file changes since last save."));
        }
        // --- Decisions ---
        if (entries.length >= 2) {
            const previous = entries[entries.length - 2];
            const prevDecisions = new Set(previous.decisions);
            const newDecisions = latest.decisions.filter((d) => !prevDecisions.has(d));
            if (newDecisions.length > 0) {
                console.log();
                newDecisions.forEach((d) => console.log(`  ${chalk_1.default.cyan("Decision added:")} "${d}"`));
            }
        }
        else if (latest.decisions.length > 0) {
            console.log();
            latest.decisions.forEach((d) => console.log(`  ${chalk_1.default.cyan("Decision:")} "${d}"`));
        }
        // --- Next Steps Progress ---
        if (entries.length >= 2) {
            const previous = entries[entries.length - 2];
            const completedSteps = previous.nextSteps.filter((step) => !latest.nextSteps.includes(step));
            if (completedSteps.length > 0) {
                console.log();
                completedSteps.forEach((s) => console.log(`  ${chalk_1.default.green("✓")} Next step completed: "${s}"`));
            }
            const newSteps = latest.nextSteps.filter((step) => !previous.nextSteps.includes(step));
            if (newSteps.length > 0) {
                newSteps.forEach((s) => console.log(`  ${chalk_1.default.blue("→")} New next step: "${s}"`));
            }
        }
        // --- Summary line ---
        const totalNew = newFiles.length;
        const totalModified = stillChanged.length;
        const totalResolved = removedFiles.length;
        console.log();
        console.log(chalk_1.default.gray(`  Summary: +${totalNew} new, ~${totalModified} modified, -${totalResolved} resolved`));
        console.log();
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
