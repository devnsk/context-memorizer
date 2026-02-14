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
export declare function parseAIChatLogs(repoPath: string): ParsedChatEntry | null;
export {};
