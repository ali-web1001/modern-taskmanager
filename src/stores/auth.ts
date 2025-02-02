import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";
import type { User, Provider, UserIdentity } from "@supabase/supabase-js";

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
            // scopes: 'user:email', // Request only the scopes you need for GitHub:
            skipBrowserRedirect: false, // Ensure browser redirect happens
            queryParams: {
              // Add any additional OAuth scopes if needed
              access_type: "offline",
              // access_type=offline is primarily associated with Google's OAuth implementation, not GitHub's.
              // As for prompt=consent, this parameter is used to control the OAuth authorization screen behavior:
              // When you set prompt=consent, you're forcing the authorization screen to appear every time, even if the user has previously authorized your application.
              //
              prompt: "consent",
              // GitHub's OAuth implementation actually uses different parameters for this purpose. According to the documentation, GitHub uses:
              // prompt: 'select_account' // Forces the account picker to appear
            },
          },
        });

        if (error) throw error;
        return data;
      } catch (error: any) {
        throw new Error(error.message || `Login with ${provider} failed`);
      }
    },

    async linkIdentity(provider: Provider) {
      try {
        // This will initiate the linking process for an already logged-in user
        const { data, error } = await supabase.auth.linkIdentity({
          provider,
        });

        if (error) throw error;
        return data;
      } catch (error: any) {
        throw new Error(`Failed to link ${provider} account: ${error.message}`);
      }
    },

    async unlinkIdentity(identity: any) {
      try {
        // Get user identities with proper type checking
        const { data, error } = await supabase.auth.getUserIdentities();

        if (error) throw error;

        // Check if data exists and has identities
        if (!data?.identities || data.identities.length < 2) {
          throw new Error(
            "Cannot unlink the only identity. Add another login method first."
          );
        }

        const { data: unlinkData, error: unlinkError } =
          await supabase.auth.unlinkIdentity(identity);
        if (unlinkError) throw unlinkError;
        return unlinkData;
      } catch (error: any) {
        throw new Error(`Failed to unlink identity: ${error.message}`);
      }
    },

    async getLinkedIdentities(): Promise<UserIdentity[]> {
      try {
        const { data, error } = await supabase.auth.getUserIdentities();

        if (error) throw error;

        // Safely handle the possibility of null data
        if (!data?.identities) {
          return [];
        }

        return data.identities;
      } catch (error: any) {
        throw new Error("Failed to fetch linked identities");
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
