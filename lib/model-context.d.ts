/**
 * Optional host-provided tool registry (the ChatGPT Sites preview injects it).
 * Declared globally so the landing page can register tools without `any`.
 */
type ModelContextTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: unknown) => unknown;
};

interface Document {
  modelContext?: {
    registerTool: (
      tool: ModelContextTool,
      options?: { signal?: AbortSignal },
    ) => unknown;
  };
}
