"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const context_1 = require("../core/context");
const DEFAULT_CONFIG = {
    defaultOutput: "clipboard",
    autoGitCapture: true,
    recentCommitCount: 5,
    defaultLogCount: 10,
    watchInterval: 5,
    autoHook: false,
    aiProvider: "https://api.openai.com/v1",
    aiModel: "gpt-4o-mini",
};
/**
 * Load user preferences from `.devctx/config.json`.
 * Returns defaults if the file doesn't exist or is malformed.
 */
async function loadConfig() {
    try {
        const dir = await (0, context_1.getDevCtxDir)();
        const configPath = path_1.default.join(dir, "config.json");
        if (!fs_1.default.existsSync(configPath))
            return { ...DEFAULT_CONFIG };
        const raw = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
        return { ...DEFAULT_CONFIG, ...raw };
    }
    catch {
        return { ...DEFAULT_CONFIG };
    }
}
/**
 * Save user preferences to `.devctx/config.json`.
 * Merges with existing config so partial updates work.
 */
async function saveConfig(partial) {
    const dir = await (0, context_1.getDevCtxDir)();
    const configPath = path_1.default.join(dir, "config.json");
    const existing = await loadConfig();
    const merged = { ...existing, ...partial };
    fs_1.default.writeFileSync(configPath, JSON.stringify(merged, null, 2));
}
