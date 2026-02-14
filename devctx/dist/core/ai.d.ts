interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
interface AIResponse {
    content: string;
    error?: string;
}
/**
 * Call an OpenAI-compatible chat completions API.
 * Works with OpenAI, Ollama, LM Studio, together.ai, etc.
 */
export declare function callAI(messages: ChatMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
}): Promise<AIResponse>;
export {};
