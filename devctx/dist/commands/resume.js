"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeCommand = resumeCommand;
const chalk_1 = __importDefault(require("chalk"));
const context_1 = require("../core/context");
const git_1 = require("../core/git");
const prompt_1 = require("../core/prompt");
const clipboard_1 = require("../utils/clipboard");
async function resumeCommand(options) {
    if (!(await (0, context_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
        return;
    }
    try {
        const branch = options?.branch || (await (0, git_1.getCurrentBranch)());
        const entries = await (0, context_1.loadBranchContext)(branch);
        if (entries.length === 0) {
            console.log(chalk_1.default.yellow(`⚠ No context found for branch: ${branch}`));
            console.log(chalk_1.default.gray("  Run `devctx save` to capture context first."));
            return;
        }
        const prompt = (0, prompt_1.generatePrompt)(entries);
        if (options?.stdout) {
            console.log(prompt);
        }
        else {
            const copied = await (0, clipboard_1.copyToClipboard)(prompt);
            if (copied) {
                console.log(chalk_1.default.green("📋 Context copied to clipboard!"));
                console.log(chalk_1.default.gray(`  Branch: ${branch} | ${entries.length} sessions | Paste into any AI tool`));
            }
            else {
                // Fallback: print to stdout if clipboard failed
                console.log(prompt);
            }
        }
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
