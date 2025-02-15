import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import { useToast } from 'vue-toastification';
import { useAuthStore } from './auth';

const toast = useToast();

export interface CustomCategory {
  id: string;
  name: string;
  created_at: string;
}

interface CategoryState {
  customCategories: CustomCategory[];
  loading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore('categories', {
  state: (): CategoryState => ({
    customCategories: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCustomCategories() {
      try {
        this.loading = true;
        const { data, error } = await supabase
          .from('custom_categories')
          .select('*')
          .order('name');

        if (error) throw error;
        this.customCategories = data;
      } catch (error: any) {
        this.error = error.message;
        toast.error('Failed to fetch categories');
      } finally {
        this.loading = false;
      }
    },

    async addCategory(name: string) {
      try {
        const authStore = useAuthStore();
        if (!authStore.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('custom_categories')
          .insert({ 
            name,
            user_id: authStore.user.id 
          })
          .select()
          .single();

        if (error) throw error;
        this.customCategories.push(data);
        toast.success('Category added successfully');
      } catch (error: any) {
        if (error.code === '23505') {
          toast.error('Category already exists');
        } else {
          toast.error('Failed to add category');
        }
        throw error;
      }
    },

    async updateCategory(id: string, name: string) {
      try {
        const { data, error } = await supabase
          .from('custom_categories')
          .update({ name })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        const index = this.customCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customCategories[index] = data;
        }

        toast.success('Category updated successfully');
      } catch (error: any) {
        if (error.code === '23505') {
          toast.error('Category name already exists');
        } else {
          toast.error('Failed to update category');
        }
        throw error;
      }
    },

    async deleteCategory(id: string) {
      try {
        const { error } = await supabase
          .from('custom_categories')
          .delete()
          .eq('id', id);

        if (error) throw error;
        this.customCategories = this.customCategories.filter(c => c.id !== id);
        toast.success('Category deleted successfully');
      } catch (error: any) {
        toast.error('Failed to delete category');
        throw error;
      }
    }
  }
});