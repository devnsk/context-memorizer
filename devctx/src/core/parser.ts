import fs from "fs";
import path from "path";
import os from "os";

interface ParsedChatEntry {
    task?: string;
    decisions: string[];
    approaches: string[];
    summary?: string;
}

/**
 * Attempt to find and parse AI chat logs from known editor locations.
 * Returns extracted context information if found.
 */
export function parseAIChatLogs(repoPath: string): ParsedChatEntry | null {
    const home = os.homedir();

    // Try known locations
    const candidates = [
        // Claude Code projects
        path.join(home, ".claude", "projects"),
        // Cursor logs
        path.join(home, ".cursor", "logs"),
        // Windsurf
        path.join(home, ".windsurf", "logs"),
    ];

    for (const dir of candidates) {
        if (!fs.existsSync(dir)) continue;

        const result = tryParseDirectory(dir, repoPath);
        if (result) return result;
    }

    return null;
}

function tryParseDirectory(
    logDir: string,
    repoPath: string
): ParsedChatEntry | null {
    try {
        const repoName = path.basename(repoPath);

        // Look for files that mention the repo
        const files = findRecentFiles(logDir, 5);

        const decisions: string[] = [];
        const approaches: string[] = [];
        let task: string | undefined;
        let summary: string | undefined;

        for (const file of files) {
            const content = fs.readFileSync(file, "utf-8");

            // Skip if doesn't seem related to this repo
            if (!content.includes(repoName) && !content.includes(repoPath)) continue;

            // Extract patterns from conversation logs
            const extracted = extractFromContent(content);
            if (extracted.task && !task) task = extracted.task;
            if (extracted.summary && !summary) summary = extracted.summary;
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
    } catch {
        return null;
    }
}

function findRecentFiles(dir: string, maxDays: number): string[] {
    const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;
    const results: string[] = [];

    try {
        const walk = (d: string, depth: number) => {
            if (depth > 3) return; // Don't recurse too deep
            const entries = fs.readdirSync(d, { withFileTypes: true });
            for (const entry of entries) {
                const full = path.join(d, entry.name);
                if (entry.isDirectory()) {
                    walk(full, depth + 1);
                } else if (
                    entry.isFile() &&
                    (entry.name.endsWith(".json") ||
                        entry.name.endsWith(".jsonl") ||
                        entry.name.endsWith(".log") ||
                        entry.name.endsWith(".md"))
                ) {
                    try {
                        const stat = fs.statSync(full);
                        if (stat.mtimeMs > cutoff) {
                            results.push(full);
                        }
                    } catch {
                        // skip inaccessible files
                    }
                }
            }
        };
        walk(dir, 0);
    } catch {
        // skip inaccessible directories
    }

    return results.sort((a, b) => {
        try {
            return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
        } catch {
            return 0;
        }
    });
}

function extractFromContent(content: string): ParsedChatEntry {
    const decisions: string[] = [];
    const approaches: string[] = [];
    let task: string | undefined;
    let summary: string | undefined;

    // Look for common patterns in AI chat logs
    const lines = content.split("\n");

    for (const line of lines) {
        const lower = line.toLowerCase();

        // Decision patterns
        if (
            lower.includes("decided to") ||
            lower.includes("decision:") ||
            lower.includes("chose to") ||
            lower.includes("going with")
        ) {
            const cleaned = line.replace(/^[\s\-*#>]+/, "").trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                decisions.push(cleaned);
            }
        }

        // Approach patterns
        if (
            lower.includes("tried") ||
            lower.includes("approach:") ||
            lower.includes("attempted") ||
            lower.includes("switched to")
        ) {
            const cleaned = line.replace(/^[\s\-*#>]+/, "").trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                approaches.push(cleaned);
            }
        }

        // Task patterns
        if (
            (lower.includes("working on") ||
                lower.includes("implementing") ||
                lower.includes("building") ||
                lower.includes("fixing")) &&
            !task
        ) {
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
