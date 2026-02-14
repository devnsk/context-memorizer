"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const git_1 = require("../core/git");
async function initCommand() {
    try {
        const root = await (0, git_1.getRepoRoot)();
        const devctxDir = path_1.default.join(root, ".devctx");
        if (fs_1.default.existsSync(devctxDir)) {
            console.log(chalk_1.default.yellow("⚠ DevContext already initialized in this repo."));
            return;
        }
        // Create directory structure
        fs_1.default.mkdirSync(path_1.default.join(devctxDir, "sessions"), { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(devctxDir, "branches"), { recursive: true });
        // Write config
        const config = {
            version: "0.1.0",
            createdAt: new Date().toISOString(),
            repo: await (0, git_1.getRepoName)(),
        };
        fs_1.default.writeFileSync(path_1.default.join(devctxDir, "config.json"), JSON.stringify(config, null, 2));
        // Add to .gitignore
        const gitignorePath = path_1.default.join(root, ".gitignore");
        const gitignoreContent = fs_1.default.existsSync(gitignorePath)
            ? fs_1.default.readFileSync(gitignorePath, "utf-8")
            : "";
        if (!gitignoreContent.includes(".devctx/")) {
            fs_1.default.appendFileSync(gitignorePath, "\n# DevContext - AI coding context\n.devctx/\n");
            console.log(chalk_1.default.gray("  Added .devctx/ to .gitignore"));
        }
        console.log(chalk_1.default.green(`✓ Initialized DevContext in ${root}`));
        console.log(chalk_1.default.gray("  Run `devctx save` to capture your first context."));
    }
    catch (err) {
        if (err.message?.includes("not a git repository")) {
            console.log(chalk_1.default.red("✗ Not a git repository. Run `git init` first."));
        }
        else {
            console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
        }
    }
}
