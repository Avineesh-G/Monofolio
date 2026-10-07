export interface AICompletionOptions {
  system: string;
  user: string;
  json?: boolean; // request strict JSON output
  signal?: AbortSignal;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  name: string;
  complete(opts: AICompletionOptions): Promise<string>;
}
