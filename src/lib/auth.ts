export type Role = "citizen" | "officer" | "admin";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
}

export const dashboardPath = (role: Role) =>
  role === "admin" ? "/admin" : role === "officer" ? "/officer" : "/citizen";