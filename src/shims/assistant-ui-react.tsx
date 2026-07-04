import type { ReactNode } from "react";

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

export function AssistantRuntimeProvider({
  children,
}: {
  runtime?: unknown;
  children?: ReactNode;
}) {
  return <>{children}</>;
}

export function useLocalRuntime(adapter: ChatModelAdapter) {
  return { adapter };
}

export function useThreadRuntime() {
  return { append() {} };
}

function Slot({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

function Empty() {
  return null;
}

export const ComposerPrimitive = {
  Root: Slot,
  Input: Empty,
  Send: Slot,
};

export const MessagePrimitive = {
  Root: Slot,
  Parts: Empty,
};

export const ThreadPrimitive = {
  Root: Slot,
  Viewport: Slot,
  Messages: Empty,
  If: Slot,
};
