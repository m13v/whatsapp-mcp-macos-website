export interface SupabaseClient {
  from(table: string): {
    insert(values: Record<string, unknown>): Promise<{
      error?: { message?: string } | null;
    }>;
  };
}

export function createClient(): SupabaseClient {
  return {
    from() {
      return {
        async insert() {
          return { error: null };
        },
      };
    },
  };
}
