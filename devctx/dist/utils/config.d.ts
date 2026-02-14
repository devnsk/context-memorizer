export interface UserConfig {
    /** Default output mode for resume: "clipboard" | "stdout" */
    defaultOutput: "clipboard" | "stdout";
    /** Whether to auto-detect and include git info */
    autoGitCapture: boolean;
    /** Number of recent commits to capture */
    recentCommitCount: number;
    /** Default number of log entries to show */
    defaultLogCount: number;
    /** Watch mode auto-save interval in minutes */
    watchInterval: number;
    /** Whether git hook is auto-installed on init */
    autoHook: boolean;
    /** AI provider base URL (OpenAI-compatible) */
    aiProvider: string;
    /** AI model name */
    aiModel: string;
    /** AI API key (prefer DEVCTX_AI_KEY env var) */
    aiApiKey?: string;
}
/**
 * Load user preferences from `.devctx/config.json`.
 * Returns defaults if the file doesn't exist or is malformed.
 */
export declare function loadConfig(): Promise<UserConfig>;
/**
 * Save user preferences to `.devctx/config.json`.
 * Merges with existing config so partial updates work.
 */
export declare function saveConfig(partial: Partial<UserConfig>): Promise<void>;
