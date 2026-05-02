import { env } from "../config/env.js";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type ChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  message?: {
    content?: string | null;
  };
  response?: string | null;
};

export class AiChatService {
  isConfigured() {
    if (env.NODE_ENV === "test") {
      return false;
    }

    return Boolean(
      env.AI_MODEL_API_URL &&
      (env.AI_MODEL_API_KEY || this.isLocalModelEndpoint(env.AI_MODEL_API_URL)),
    );
  }

  async completeJson(messages: ChatMessage[]) {
    if (!this.isConfigured()) {
      throw new Error("AI model is not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (env.AI_MODEL_API_KEY) {
      headers.Authorization = `Bearer ${env.AI_MODEL_API_KEY}`;
    }

    const requestBody: Record<string, unknown> = {
      model: env.AI_MODEL_NAME,
      temperature: 0.3,
      messages,
    };
    if (!this.isLocalModelEndpoint(env.AI_MODEL_API_URL!)) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch(env.AI_MODEL_API_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`AI model returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as ChatResponse;
    const rawContent =
      payload.choices?.[0]?.message?.content?.trim() ||
      payload.message?.content?.trim() ||
      payload.response?.trim();

    if (!rawContent) {
      throw new Error("AI model returned an empty response");
    }

    return JSON.parse(this.extractJsonObject(rawContent)) as Record<
      string,
      unknown
    >;
  }

  private isLocalModelEndpoint(url: string) {
    try {
      const parsed = new URL(url);
      return ["127.0.0.1", "localhost"].includes(parsed.hostname);
    } catch {
      return false;
    }
  }

  private extractJsonObject(rawContent: string) {
    const trimmed = rawContent.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed;
    }

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI model did not return a JSON object");
    }

    return trimmed.slice(start, end + 1);
  }
}
