import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";
import type { User, Provider } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface ProfileUpdateData {
  name: string;
  avatar_url?: string;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    loading: true,
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
              name,
            },
          },
        });

        if (error) throw error;
        this.user = data.user;
      } catch (error: any) {
        throw new Error(error.message || "Registration failed");
      }
    },

    async login(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        this.user = data.user;
      } catch (error: any) {
        throw new Error(error.message || "Login failed");
      }
    },

    async loginWithProvider(provider: Provider) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
      } catch (error: any) {
        throw new Error(error.message || `Login with ${provider} failed`);
      }
    },

    async logout() {
      try {
        // First clear local state
        this.user = null;

        // Then attempt to clear server session
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn("Logout warning:", error);
        }
      } catch (error: any) {
        console.warn("Logout warning:", error);
      }
    },

    async checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        this.user = session?.user ?? null;
      } catch (error) {
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data: ProfileUpdateData) {
      try {
        if (!this.user) {
          throw new Error("You must be logged in to update your profile");
        }

        // If there's an avatar URL, update it
        if (data.avatar_url) {
          const fileName = `avatar-${this.user.id}-${Date.now()}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, data.avatar_url);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

          data.avatar_url = urlData.publicUrl;
        }

        const { error } = await supabase.auth.updateUser({
          data: {
            name: data.name,
            avatar_url: data.avatar_url,
          },
        });

        if (error) throw error;

        // Update local user state
        if (this.user) {
          this.user.user_metadata = {
            ...this.user.user_metadata,
            ...data,
          };
        }

        return { success: true };
      } catch (error: any) {
        throw new Error(error.message || "Failed to update profile");
      }
    },
  },
});
