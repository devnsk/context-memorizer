"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCommand = logCommand;
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../core/context");
const git_1 = require("../core/git");
async function logCommand(options) {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        const count = parseInt(options?.count || "10", 10);
        if (options?.all) {
            const sessions = await (0, context_1.loadAllSessions)();
            if (sessions.length === 0) {
                console.log(chalk_1.default.yellow("No context entries found."));
                return;
            }
            console.log(chalk_1.default.bold("\nAll branches:\n"));
            sessions.slice(0, count).forEach((s) => {
                const date = new Date(s.timestamp).toLocaleString();
                console.log(`  ${chalk_1.default.gray(`[${date}]`)} ${chalk_1.default.cyan(s.branch)} ${s.task}`);
            });
        }
        else {
            const branch = await (0, git_1.getCurrentBranch)();
            const entries = await (0, context_1.loadBranchContext)(branch);
            if (entries.length === 0) {
                console.log(chalk_1.default.yellow(`No context for branch: ${branch}`));
                return;
            }
            console.log(chalk_1.default.bold(`\nBranch: ${branch}\n`));
            entries
                .slice(-count)
                .reverse()
                .forEach((e) => {
                const date = new Date(e.timestamp).toLocaleString();
                console.log(`  ${chalk_1.default.gray(`[${date}]`)} ${e.task}`);
                if (e.currentState) {
                    console.log(`    ${chalk_1.default.gray("└─")} ${e.currentState}`);
                }
            });
        }
        console.log();
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
