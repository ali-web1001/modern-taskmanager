import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";
import type { User, Provider } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface ProfileUpdateData {
  name: string;
  avatar_url?: string | File; // Modified to accept File type
}

// interface UploadResponse {
//   path: string;
//   fullPath: string;
// }

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
        const redirectUrl = `${window.location.origin}/auth/callback`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: false, // Ensure browser redirect happens
            queryParams: {
              // Add any additional OAuth scopes if needed
              access_type: "offline",
              prompt: "consent",
            },
          },
        });

        if (error) throw error;
        return data;
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

    // In your auth store
    async checkAuth() {
      try {
        this.loading = true;
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        this.user = session?.user ?? null;
        return session;
      } catch (error) {
        console.error("Auth check failed:", error);
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data: ProfileUpdateData) {
      try {
        if (!this.user) {
          throw new Error("You must be logged in to update your profile");
        }

        let avatarUrl = data.avatar_url;

        // Handle file upload if the avatar_url is actually a File object
        if (data.avatar_url instanceof File) {
          const file = data.avatar_url;
          const fileExt = file.name.split(".").pop();
          const fileName = `avatar-${this.user.id}-${Date.now()}.${fileExt}`;

          // Upload the file to Supabase Storage and use the upload response
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("avatars").upload(fileName, file, {
              cacheControl: "86400",
              upsert: true,
              contentType: file.type,
            });

          if (uploadError) {
            // console.error("Upload error:", uploadError);
            throw new Error("Failed to upload avatar image");
          }

          // Verify upload was successful and we have the file path
          if (!uploadData?.path) {
            throw new Error("Upload succeeded but file path is missing");
          }

          // Get the public URL using the path from the upload response
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(uploadData.path);

          if (!urlData?.publicUrl) {
            throw new Error("Failed to generate public URL for uploaded file");
          }

          avatarUrl = urlData.publicUrl;
        }

        // Update user profile with new data
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            name: data.name,
            avatar_url: avatarUrl,
          },
        });

        if (updateError) {
          // console.error("Profile update error:", updateError);
          throw updateError;
        }

        // Update local user state
        if (this.user) {
          this.user.user_metadata = {
            ...this.user.user_metadata,
            name: data.name,
            avatar_url: avatarUrl,
          };
        }

        return {
          success: true,
          avatarUrl, // Return the new avatar URL in case it's needed
        };
      } catch (error: any) {
        console.error("Profile update failed:", error);
        throw new Error(error.message || "Failed to update profile");
      }
    },
  },
});
