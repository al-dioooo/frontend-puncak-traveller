export const localAuthRoutes = {
  google: "/api/auth/google",
  login: "/api/auth/login",
} as const;

export type BasicLoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

export type AuthUser = {
  id?: string | number;
  name: string;
  email: string;
};

export type LoginResult = {
  user?: AuthUser;
  token?: string;
  message?: string;
};
