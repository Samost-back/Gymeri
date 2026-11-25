export type Role = "client" | "trainer" | "gym_owner" | "admin";

export type User = {
  id: number;
  email: string;
  role: Role;
};

export type Credentials = {
  email: string;
  password: string;
};
