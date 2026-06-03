export const localAuthRoutes = {
  google: "/api/auth/google",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
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
  role?: string;
};

export type LoginResult = {
  user?: AuthUser;
  message?: string;
};
