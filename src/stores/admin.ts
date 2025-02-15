import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";
import type { AdminUser, UserRole } from "../types/roles";
import { useToast } from "vue-toastification";

const toast = useToast();

interface AdminState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

export const useAdminStore = defineStore("admin", {
  state: (): AdminState => ({
    users: [],
    loading: false,
    error: null,
    isAdmin: false,
  }),

  actions: {
    async checkAdminStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data, error } = await supabase.rpc("is_admin", {
          user_id: user.id,
        });

        if (error) throw error;
        this.isAdmin = !!data;
        return this.isAdmin;
      } catch (error: any) {
        console.error("Admin check failed:", error);
        this.isAdmin = false;
        return false;
      }
    },
    // stores/admin.ts
    async checkEditorStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data, error } = await supabase.rpc("is_editor", {
          user_id: user.id,
        });

        if (error) throw error;
        return !!data;
      } catch (error) {
        console.error("Editor check failed:", error);
        return false;
      }
    },
    
    async fetchUsers() {
      try {
        this.loading = true;
        this.error = null;

        // First check if user is admin
        const isAdmin = await this.checkAdminStatus();
        if (!isAdmin) {
          throw new Error("Access denied. Admin privileges required.");
        }

        // Use the secure RPC function to get users
        const { data: users, error: usersError } = await supabase.rpc(
          "get_users_for_admin"
        );

        if (usersError) throw usersError;

        // Map the response directly since it includes roles
        this.users = (users || []).map(
          (user: {
            id: any;
            email: any;
            role: string | undefined;
            created_at: any;
            last_sign_in: any;
            user_metadata: any;
          }) => ({
            id: user.id,
            email: user.email,
            role: user.role as UserRole | undefined,
            created_at: user.created_at,
            last_sign_in: user.last_sign_in,
            user_metadata: user.user_metadata,
          })
        );
      } catch (error: any) {
        this.error = error.message;
        toast.error(error.message);
      } finally {
        this.loading = false;
      }
    },

    async assignRole(userId: string, role: UserRole) {
      try {
        const isAdmin = await this.checkAdminStatus();
        if (!isAdmin) {
          throw new Error("Access denied. Admin privileges required.");
        }

        const { error } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        const userIndex = this.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex].role = role;
        }

        toast.success(`Role ${role} assigned successfully`);
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to assign role");
        throw error;
      }
    },

    async removeRole(userId: string) {
      try {
        const isAdmin = await this.checkAdminStatus();
        if (!isAdmin) {
          throw new Error("Access denied. Admin privileges required.");
        }

        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;

        // Update local state
        const userIndex = this.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex].role = undefined;
        }

        toast.success("Role removed successfully");
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to remove role");
        throw error;
      }
    },
  },
});
