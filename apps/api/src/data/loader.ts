import type { UserProfile } from "@plum/shared";

export interface DataSource {
  all(): UserProfile[];
  findByContact(query: string): UserProfile | null;
  findById(id: string): UserProfile | null;
  reload(): Promise<void>;
}
