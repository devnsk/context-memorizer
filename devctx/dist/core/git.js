"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentBranch = getCurrentBranch;
exports.getRepoName = getRepoName;
exports.getChangedFiles = getChangedFiles;
exports.getStagedFiles = getStagedFiles;
exports.getRecentCommits = getRecentCommits;
exports.getAuthor = getAuthor;
exports.getRepoRoot = getRepoRoot;
const simple_git_1 = __importDefault(require("simple-git"));
const git = (0, simple_git_1.default)();
async function getCurrentBranch() {
    const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
    return branch.trim();
}
async function getRepoName() {
    const remote = await git.remote(["get-url", "origin"]).catch(() => null);
    if (remote) {
        const name = remote.trim().split("/").pop()?.replace(".git", "") || "unknown";
        return name;
    }
    const root = await git.revparse(["--show-toplevel"]);
    return root.trim().split("/").pop() || "unknown";
}
async function getChangedFiles() {
    const status = await git.status();
    return [...status.modified, ...status.created, ...status.not_added];
}
async function getStagedFiles() {
    const status = await git.status();
    return status.staged;
}
async function getRecentCommits(count = 5) {
    const log = await git.log({ maxCount: count });
    return log.all.map((c) => `${c.hash.slice(0, 7)} ${c.message}`);
}
async function getAuthor() {
    const name = await git.raw(["config", "user.name"]).catch(() => "unknown");
    return name.trim();
}
async function getRepoRoot() {
    const root = await git.revparse(["--show-toplevel"]);
    return root.trim();
}
