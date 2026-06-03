export const localAuthRoutes = {
  google: "/api/auth/google",
  forgotPassword: "/api/auth/forgot-password",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  register: "/api/auth/register",
  resetPassword: "/api/auth/reset-password",
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
  status?: string;
};

export type LoginResult = {
  user?: AuthUser;
  message?: string;
};
