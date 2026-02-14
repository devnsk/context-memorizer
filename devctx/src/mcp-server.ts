#!/usr/bin/env node
/**
 * DevContext MCP Server
 *
 * Exposes DevContext functionality as MCP tools and resources
 * for Claude Code and other MCP-compatible clients.
 *
 * Usage:
 *   devctx-mcp                    # stdio transport (default)
 *
 * Configure in Claude Code's MCP settings:
 *   {
 *     "mcpServers": {
 *       "devctx": {
 *         "command": "devctx-mcp"
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { isInitialized, loadBranchContext, loadAllSessions, saveContext } from "./core/context";
import { getCurrentBranch, getRepoName, getChangedFiles, getStagedFiles, getRecentCommits, getAuthor } from "./core/git";
import { generatePrompt } from "./core/prompt";
import { ContextEntry } from "./core/types";
import { v4 as uuid } from "uuid";

const server = new McpServer({
    name: "devctx",
    version: "0.5.0",
});

// --- Tools ---

server.tool(
    "devctx_resume",
    "Generate AI-ready context prompt for the current or specified branch",
    {
        branch: z.string().optional().describe("Branch name to resume. Defaults to current branch."),
    },
    async ({ branch }) => {
        if (!(await isInitialized())) {
            return { content: [{ type: "text" as const, text: "DevContext not initialized. Run `devctx init` first." }] };
        }

        const targetBranch = branch || (await getCurrentBranch());
        const entries = await loadBranchContext(targetBranch);

        if (entries.length === 0) {
            return {
                content: [{ type: "text" as const, text: `No context found for branch: ${targetBranch}. Run \`devctx save\` first.` }],
            };
        }

        const prompt = generatePrompt(entries);
        return { content: [{ type: "text" as const, text: prompt }] };
    }
);

server.tool(
    "devctx_save",
    "Save current coding context with a message",
    {
        message: z.string().describe("Description of what you were working on"),
        goal: z.string().optional().describe("Goal or ticket reference"),
        approaches: z.array(z.string()).optional().describe("Approaches tried"),
        decisions: z.array(z.string()).optional().describe("Key decisions made"),
        currentState: z.string().optional().describe("Current state of the work"),
        nextSteps: z.array(z.string()).optional().describe("Next steps"),
    },
    async ({ message, goal, approaches, decisions, currentState, nextSteps }) => {
        if (!(await isInitialized())) {
            return { content: [{ type: "text" as const, text: "DevContext not initialized. Run `devctx init` first." }] };
        }

        const [branch, repo, filesChanged, filesStaged, recentCommits, author] = await Promise.all([
            getCurrentBranch(),
            getRepoName(),
            getChangedFiles(),
            getStagedFiles(),
            getRecentCommits(),
            getAuthor(),
        ]);

        const entry: ContextEntry = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            branch,
            repo,
            author,
            task: message,
            goal,
            approaches: approaches || [],
            decisions: decisions || [],
            currentState: currentState || message,
            nextSteps: nextSteps || [],
            filesChanged,
            filesStaged,
            recentCommits,
        };

        await saveContext(entry);

        return {
            content: [
                {
                    type: "text" as const,
                    text: `Context saved for branch: ${branch}\n${filesChanged.length} files changed, ${recentCommits.length} recent commits captured.`,
                },
            ],
        };
    }
);

server.tool(
    "devctx_log",
    "View context history for the current branch or all branches",
    {
        all: z.boolean().optional().describe("Show all branches"),
        count: z.number().optional().describe("Number of entries to show"),
    },
    async ({ all, count }) => {
        if (!(await isInitialized())) {
            return { content: [{ type: "text" as const, text: "DevContext not initialized." }] };
        }

        const limit = count || 10;

        if (all) {
            const sessions = await loadAllSessions();
            if (sessions.length === 0) {
                return { content: [{ type: "text" as const, text: "No context entries found." }] };
            }

            const lines = sessions.slice(0, limit).map((s) => {
                const date = new Date(s.timestamp).toLocaleString();
                return `[${date}] ${s.branch} — ${s.task}`;
            });

            return { content: [{ type: "text" as const, text: `All branches:\n\n${lines.join("\n")}` }] };
        }

        const branch = await getCurrentBranch();
        const entries = await loadBranchContext(branch);

        if (entries.length === 0) {
            return { content: [{ type: "text" as const, text: `No context for branch: ${branch}` }] };
        }

        const lines = entries
            .slice(-limit)
            .reverse()
            .map((e) => {
                const date = new Date(e.timestamp).toLocaleString();
                return `[${date}] ${e.task}${e.currentState ? `\n  └─ ${e.currentState}` : ""}`;
            });

        return {
            content: [{ type: "text" as const, text: `Branch: ${branch}\n\n${lines.join("\n")}` }],
        };
    }
);

// --- Resources ---

server.resource(
    "context",
    "devctx://context",
    async (uri) => {
        if (!(await isInitialized())) {
            return { contents: [{ uri: uri.href, text: "DevContext not initialized.", mimeType: "text/plain" }] };
        }

        const branch = await getCurrentBranch();
        const entries = await loadBranchContext(branch);

        if (entries.length === 0) {
            return { contents: [{ uri: uri.href, text: "No context found.", mimeType: "text/plain" }] };
        }

        const prompt = generatePrompt(entries);
        return { contents: [{ uri: uri.href, text: prompt, mimeType: "text/markdown" }] };
    }
);

// --- Start ---

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error("MCP server error:", err);
    process.exit(1);
});
