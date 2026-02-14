export interface ContextEntry {
    id: string;
    timestamp: string;
    branch: string;
    repo: string;
    author: string;
    task: string;
    goal?: string;
    approaches: string[];
    decisions: string[];
    currentState: string;
    nextSteps: string[];
    blockers?: string[];
    filesChanged: string[];
    filesStaged: string[];
    recentCommits: string[];
    assignee?: string;
    handoffNote?: string;
}
export interface DevCtxConfig {
    version: string;
    createdAt: string;
    repo: string;
}
