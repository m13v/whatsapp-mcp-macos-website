export const SchemaType = {
  OBJECT: "object",
  STRING: "string",
} as const;

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
  constructor(_apiKey: string) {}

  getGenerativeModel() {
    return {
      startChat() {
        return {
          async sendMessage() {
            throw new Error("Guide chat is disabled on this site.");
          },
        };
      },
    };
  }
}
