"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareCommand = shareCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const simple_git_1 = __importDefault(require("simple-git"));
const git_1 = require("../core/git");
const git = (0, simple_git_1.default)();
async function shareCommand(options) {
    try {
        const root = await (0, git_1.getRepoRoot)();
        const gitignorePath = path_1.default.join(root, ".gitignore");
        const devctxDir = path_1.default.join(root, ".devctx");
        if (!fs_1.default.existsSync(devctxDir)) {
            console.log(chalk_1.default.red("✗ DevContext not initialized. Run `devctx init` first."));
            return;
        }
        if (options?.stop) {
            // Add .devctx/ back to .gitignore
            const gitignoreContent = fs_1.default.existsSync(gitignorePath)
                ? fs_1.default.readFileSync(gitignorePath, "utf-8")
                : "";
            if (!gitignoreContent.includes(".devctx/")) {
                fs_1.default.appendFileSync(gitignorePath, "\n.devctx/\n");
            }
            console.log(chalk_1.default.green("✓ Stopped sharing DevContext"));
            console.log(chalk_1.default.gray("  .devctx/ added back to .gitignore"));
            console.log(chalk_1.default.gray("  Note: Existing .devctx/ files remain in git history."));
            return;
        }
        // Remove .devctx/ from .gitignore
        if (fs_1.default.existsSync(gitignorePath)) {
            let content = fs_1.default.readFileSync(gitignorePath, "utf-8");
            content = content
                .split("\n")
                .filter((line) => line.trim() !== ".devctx/" &&
                line.trim() !== ".devctx" &&
                line.trim() !== "# DevContext - AI coding context")
                .join("\n");
            fs_1.default.writeFileSync(gitignorePath, content);
        }
        // Stage .devctx/ and commit
        await git.add([".devctx/", ".gitignore"]);
        await git.commit("chore: share DevContext with team");
        console.log(chalk_1.default.green("✓ DevContext is now shared with your team!"));
        console.log(chalk_1.default.gray("  .devctx/ removed from .gitignore"));
        console.log(chalk_1.default.gray("  Committed: \"chore: share DevContext with team\""));
        console.log(chalk_1.default.gray("\n  Push to share: git push"));
        console.log(chalk_1.default.gray("  Stop sharing: devctx share --stop"));
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
