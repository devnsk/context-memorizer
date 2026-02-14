"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevCtxDir = getDevCtxDir;
exports.isInitialized = isInitialized;
exports.saveContext = saveContext;
exports.loadBranchContext = loadBranchContext;
exports.loadAllSessions = loadAllSessions;
exports.mergeContexts = mergeContexts;
exports.syncBranchContext = syncBranchContext;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const git_1 = require("./git");
async function getDevCtxDir() {
    const root = await (0, git_1.getRepoRoot)();
    return path_1.default.join(root, ".devctx");
}
async function isInitialized() {
    const dir = await getDevCtxDir();
    return fs_1.default.existsSync(dir);
}
async function saveContext(entry) {
    const dir = await getDevCtxDir();
    const sessionsDir = path_1.default.join(dir, "sessions");
    const branchesDir = path_1.default.join(dir, "branches");
    fs_1.default.mkdirSync(sessionsDir, { recursive: true });
    fs_1.default.mkdirSync(branchesDir, { recursive: true });
    // Save session
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
    const sessionFile = path_1.default.join(sessionsDir, `${timestamp}.json`);
    fs_1.default.writeFileSync(sessionFile, JSON.stringify(entry, null, 2));
    // Update branch context (latest for this branch)
    const branchFile = path_1.default.join(branchesDir, `${entry.branch.replace(/\//g, "__")}.json`);
    // Load existing entries or start fresh
    let branchEntries = [];
    if (fs_1.default.existsSync(branchFile)) {
        branchEntries = JSON.parse(fs_1.default.readFileSync(branchFile, "utf-8"));
    }
    branchEntries.push(entry);
    fs_1.default.writeFileSync(branchFile, JSON.stringify(branchEntries, null, 2));
    return sessionFile;
}
async function loadBranchContext(branch) {
    const dir = await getDevCtxDir();
    const branchFile = path_1.default.join(dir, "branches", `${branch.replace(/\//g, "__")}.json`);
    if (!fs_1.default.existsSync(branchFile))
        return [];
    return JSON.parse(fs_1.default.readFileSync(branchFile, "utf-8"));
}
async function loadAllSessions() {
    const dir = await getDevCtxDir();
    const sessionsDir = path_1.default.join(dir, "sessions");
    if (!fs_1.default.existsSync(sessionsDir))
        return [];
    const files = fs_1.default.readdirSync(sessionsDir).filter((f) => f.endsWith(".json")).sort().reverse();
    return files.map((f) => JSON.parse(fs_1.default.readFileSync(path_1.default.join(sessionsDir, f), "utf-8")));
}
/**
 * Merge context entries from multiple sources (e.g., after git pull).
 * Deduplicates by ID and sorts by timestamp.
 */
function mergeContexts(local, remote) {
    const merged = new Map();
    for (const entry of [...local, ...remote]) {
        const existing = merged.get(entry.id);
        if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
            merged.set(entry.id, entry);
        }
    }
    return Array.from(merged.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
/**
 * Sync branch context file after pulling shared context.
 * Merges local entries with whatever is on disk (which may have been updated by git pull).
 */
async function syncBranchContext(branch) {
    const dir = await getDevCtxDir();
    const branchFile = path_1.default.join(dir, "branches", `${branch.replace(/\//g, "__")}.json`);
    if (!fs_1.default.existsSync(branchFile))
        return [];
    const diskEntries = JSON.parse(fs_1.default.readFileSync(branchFile, "utf-8"));
    // Deduplicate (in case of merge conflicts resolved by git)
    const deduped = mergeContexts([], diskEntries);
    fs_1.default.writeFileSync(branchFile, JSON.stringify(deduped, null, 2));
    return deduped;
}
