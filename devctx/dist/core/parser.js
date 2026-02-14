"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAIChatLogs = parseAIChatLogs;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
/**
 * Attempt to find and parse AI chat logs from known editor locations.
 * Returns extracted context information if found.
 */
function parseAIChatLogs(repoPath) {
    const home = os_1.default.homedir();
    // Try known locations
    const candidates = [
        // Claude Code projects
        path_1.default.join(home, ".claude", "projects"),
        // Cursor logs
        path_1.default.join(home, ".cursor", "logs"),
        // Windsurf
        path_1.default.join(home, ".windsurf", "logs"),
    ];
    for (const dir of candidates) {
        if (!fs_1.default.existsSync(dir))
            continue;
        const result = tryParseDirectory(dir, repoPath);
        if (result)
            return result;
    }
    return null;
}
function tryParseDirectory(logDir, repoPath) {
    try {
        const repoName = path_1.default.basename(repoPath);
        // Look for files that mention the repo
        const files = findRecentFiles(logDir, 5);
        const decisions = [];
        const approaches = [];
        let task;
        let summary;
        for (const file of files) {
            const content = fs_1.default.readFileSync(file, "utf-8");
            // Skip if doesn't seem related to this repo
            if (!content.includes(repoName) && !content.includes(repoPath))
                continue;
            // Extract patterns from conversation logs
            const extracted = extractFromContent(content);
            if (extracted.task && !task)
                task = extracted.task;
            if (extracted.summary && !summary)
                summary = extracted.summary;
            decisions.push(...extracted.decisions);
            approaches.push(...extracted.approaches);
        }
        if (!task && !summary && decisions.length === 0 && approaches.length === 0) {
            return null;
        }
        return {
            task,
            decisions: [...new Set(decisions)],
            approaches: [...new Set(approaches)],
            summary,
        };
    }
    catch {
        return null;
    }
}
function findRecentFiles(dir, maxDays) {
    const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;
    const results = [];
    try {
        const walk = (d, depth) => {
            if (depth > 3)
                return; // Don't recurse too deep
            const entries = fs_1.default.readdirSync(d, { withFileTypes: true });
            for (const entry of entries) {
                const full = path_1.default.join(d, entry.name);
                if (entry.isDirectory()) {
                    walk(full, depth + 1);
                }
                else if (entry.isFile() &&
                    (entry.name.endsWith(".json") ||
                        entry.name.endsWith(".jsonl") ||
                        entry.name.endsWith(".log") ||
                        entry.name.endsWith(".md"))) {
                    try {
                        const stat = fs_1.default.statSync(full);
                        if (stat.mtimeMs > cutoff) {
                            results.push(full);
                        }
                    }
                    catch {
                        // skip inaccessible files
                    }
                }
            }
        };
        walk(dir, 0);
    }
    catch {
        // skip inaccessible directories
    }
    return results.sort((a, b) => {
        try {
            return fs_1.default.statSync(b).mtimeMs - fs_1.default.statSync(a).mtimeMs;
        }
        catch {
            return 0;
        }
    });
}
function extractFromContent(content) {
    const decisions = [];
    const approaches = [];
    let task;
    let summary;
    // Look for common patterns in AI chat logs
    const lines = content.split("\n");
    for (const line of lines) {
        const lower = line.toLowerCase();
        // Decision patterns
        if (lower.includes("decided to") ||
            lower.includes("decision:") ||
            lower.includes("chose to") ||
            lower.includes("going with")) {
            const cleaned = line.replace(/^[\s\-*#>]+/, "").trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                decisions.push(cleaned);
            }
        }
        // Approach patterns
        if (lower.includes("tried") ||
            lower.includes("approach:") ||
            lower.includes("attempted") ||
            lower.includes("switched to")) {
            const cleaned = line.replace(/^[\s\-*#>]+/, "").trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                approaches.push(cleaned);
            }
        }
        // Task patterns
        if ((lower.includes("working on") ||
            lower.includes("implementing") ||
            lower.includes("building") ||
            lower.includes("fixing")) &&
            !task) {
            const cleaned = line.replace(/^[\s\-*#>]+/, "").trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                task = cleaned;
            }
        }
    }
    return {
        task,
        decisions: decisions.slice(0, 10), // cap at 10
        approaches: approaches.slice(0, 10),
        summary,
    };
}
