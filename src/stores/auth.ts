import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: true
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async register(email: string, password: string, name: string) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name
            }
          }
        });

        if (error) throw error;
        this.user = data.user;
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed');
      }
    },

    async login(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        this.user = data.user;
      } catch (error: any) {
        throw new Error(error.message || 'Login failed');
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        this.user = null;
      } catch (error: any) {
        throw new Error(error.message || 'Logout failed');
      }
    },

    async checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        this.user = session?.user ?? null;
      } catch (error) {
        this.user = null;
      } finally {
        this.loading = false;
      }
    }
    
  }
});