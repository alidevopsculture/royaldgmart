export const logError = (context: string, error: unknown) => {
  console.error(`[ERROR] ${context}:`, error instanceof Error ? error.message : error);
};
