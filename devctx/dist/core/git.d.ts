export declare function getCurrentBranch(): Promise<string>;
export declare function getRepoName(): Promise<string>;
export declare function getChangedFiles(): Promise<string[]>;
export declare function getStagedFiles(): Promise<string[]>;
export declare function getRecentCommits(count?: number): Promise<string[]>;
export declare function getAuthor(): Promise<string>;
export declare function getRepoRoot(): Promise<string>;
