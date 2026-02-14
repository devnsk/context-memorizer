"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookCommand = hookCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const git_1 = require("../core/git");
async function hookCommand(action) {
    try {
        const root = await (0, git_1.getRepoRoot)();
        const hooksDir = path_1.default.join(root, ".git", "hooks");
        const hookPath = path_1.default.join(hooksDir, "post-commit");
        if (action === "remove") {
            if (!fs_1.default.existsSync(hookPath)) {
                console.log(chalk_1.default.yellow("⚠ No DevContext git hook found."));
                return;
            }
            const content = fs_1.default.readFileSync(hookPath, "utf-8");
            if (!content.includes("devctx")) {
                console.log(chalk_1.default.yellow("⚠ post-commit hook exists but was not created by DevContext."));
                return;
            }
            // Remove only the devctx line, preserve other hooks
            const lines = content.split("\n").filter((l) => !l.includes("devctx"));
            if (lines.filter((l) => l.trim() && !l.startsWith("#!")).length === 0) {
                fs_1.default.unlinkSync(hookPath);
            }
            else {
                fs_1.default.writeFileSync(hookPath, lines.join("\n"));
                fs_1.default.chmodSync(hookPath, "755");
            }
            console.log(chalk_1.default.green("✓ Removed DevContext post-commit hook"));
            return;
        }
        // Default: install
        fs_1.default.mkdirSync(hooksDir, { recursive: true });
        let hookContent = "#!/bin/sh\n";
        if (fs_1.default.existsSync(hookPath)) {
            const existing = fs_1.default.readFileSync(hookPath, "utf-8");
            if (existing.includes("devctx")) {
                console.log(chalk_1.default.yellow("⚠ DevContext post-commit hook already installed."));
                return;
            }
            // Append to existing hook
            hookContent = existing.trimEnd() + "\n";
        }
        hookContent += `\n# DevContext auto-snapshot on commit\ndevctx save "Auto-saved on commit: $(git log -1 --pretty=%B | head -1)" 2>/dev/null || true\n`;
        fs_1.default.writeFileSync(hookPath, hookContent);
        fs_1.default.chmodSync(hookPath, "755");
        console.log(chalk_1.default.green("✓ Installed DevContext post-commit hook"));
        console.log(chalk_1.default.gray("  Context will be auto-saved on every commit."));
        console.log(chalk_1.default.gray("  Remove with: devctx hook remove"));
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
