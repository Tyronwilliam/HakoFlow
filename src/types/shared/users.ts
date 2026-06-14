export interface UserRow {
  avatar_color: string | null;
  avatar_url: string | null;
  created_at: string;
  email: string;
  id: string;
  name: string | null;
  plan: "free" | "pro";
  plan_ends_at: string | null;
  theme: "dark" | "light";
}
