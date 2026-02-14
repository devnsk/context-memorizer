import { ContextEntry } from "./types";
export declare function getDevCtxDir(): Promise<string>;
export declare function isInitialized(): Promise<boolean>;
export declare function saveContext(entry: ContextEntry): Promise<string>;
export declare function loadBranchContext(branch: string): Promise<ContextEntry[]>;
export declare function loadAllSessions(): Promise<ContextEntry[]>;
/**
 * Merge context entries from multiple sources (e.g., after git pull).
 * Deduplicates by ID and sorts by timestamp.
 */
export declare function mergeContexts(local: ContextEntry[], remote: ContextEntry[]): ContextEntry[];
/**
 * Sync branch context file after pulling shared context.
 * Merges local entries with whatever is on disk (which may have been updated by git pull).
 */
export declare function syncBranchContext(branch: string): Promise<ContextEntry[]>;
