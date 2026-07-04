declare module "posthog-js" {
  export interface PostHog {
    init: (key: string, options?: Record<string, unknown>) => void;
    capture: (event: string, properties?: Record<string, unknown>) => void;
  }

  const posthog: PostHog;
  export default posthog;
}

declare module "@assistant-ui/react" {
  import type { ComponentType, ReactNode } from "react";

  export type AssistantTextPart = { type: "text"; text: string };
  export type AssistantMessage = {
    role: "assistant" | "user";
    content: AssistantTextPart[];
  };

  export interface ChatModelAdapter {
    run(args: {
      messages: AssistantMessage[];
      abortSignal?: AbortSignal;
    }): AsyncGenerator<unknown, void, unknown> | Promise<unknown>;
  }

  export const AssistantRuntimeProvider: ComponentType<{
    runtime: unknown;
    children?: ReactNode;
  }>;

  export function useLocalRuntime(adapter: ChatModelAdapter): unknown;
  export function useThreadRuntime(): {
    append(message: AssistantMessage): void;
  };

  export const ComposerPrimitive: {
    Root: ComponentType<Record<string, unknown>>;
    Input: ComponentType<Record<string, unknown>>;
    Send: ComponentType<Record<string, unknown>>;
  };

  export const MessagePrimitive: {
    Root: ComponentType<Record<string, unknown>>;
    Parts: ComponentType<Record<string, unknown>>;
  };

  export const ThreadPrimitive: {
    Root: ComponentType<Record<string, unknown>>;
    Viewport: ComponentType<Record<string, unknown>>;
    Messages: ComponentType<Record<string, unknown>>;
    If: ComponentType<Record<string, unknown>>;
  };
}

declare module "@google/generative-ai" {
  export const SchemaType: {
    OBJECT: "object";
    STRING: "string";
  };

  export interface FunctionDeclaration {
    name: string;
    description?: string;
    parameters?: unknown;
  }

  export interface FunctionDeclarationsTool {
    functionDeclarations: FunctionDeclaration[];
  }

  export type Part = {
    text?: string;
    functionResponse?: {
      name: string;
      response: Record<string, unknown>;
    };
  };

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: {
      model: string;
      systemInstruction?: string;
      tools?: FunctionDeclarationsTool[];
    }): {
      startChat(config: {
        history: { role: "model" | "user"; parts: { text: string }[] }[];
      }): {
        sendMessage(input: string | Part[]): Promise<{
          response: {
            text(): string;
            functionCalls(): Array<{
              name: string;
              args: Record<string, unknown>;
            }> | undefined;
            usageMetadata?: {
              promptTokenCount?: number;
              candidatesTokenCount?: number;
              totalTokenCount?: number;
            };
          };
        }>;
      };
    };
  }
}

declare module "@supabase/supabase-js" {
  export interface SupabaseClient {
    from(table: string): {
      insert(values: Record<string, unknown>): Promise<{
        error?: { message?: string } | null;
      }>;
    };
  }

  export function createClient(
    url: string,
    key: string,
    options?: Record<string, unknown>,
  ): SupabaseClient;
}
