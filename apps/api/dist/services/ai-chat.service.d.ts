type ChatMessage = {
    role: "system" | "user";
    content: string;
};
export declare class AiChatService {
    isConfigured(): boolean;
    completeJson(messages: ChatMessage[]): Promise<Record<string, unknown>>;
    private isLocalModelEndpoint;
    private extractJsonObject;
}
export {};
