export type UserRole = 'admin' | 'editor';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role?: UserRole;
  created_at: string;
  last_sign_in?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}