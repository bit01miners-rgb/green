// Supabase client is initialized on the server side.
// Frontend communicates via Express API endpoints.
// This file provides types and helpers for the frontend.

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
