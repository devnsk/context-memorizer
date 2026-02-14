/**
 * Copy text to the system clipboard.
 * Falls back gracefully in headless / CI environments.
 */
export declare function copyToClipboard(text: string): Promise<boolean>;
