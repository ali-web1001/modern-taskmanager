import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import { useToast } from 'vue-toastification';
import { useAuthStore } from './auth';

const toast = useToast();

export interface CustomLabel {
  id: string;
  name: string;
  created_at: string;
}

interface LabelState {
  customLabels: CustomLabel[];
  loading: boolean;
  error: string | null;
}

export const useLabelStore = defineStore('labels', {
  state: (): LabelState => ({
    customLabels: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCustomLabels() {
      try {
        this.loading = true;
        const { data, error } = await supabase
          .from('custom_labels')
          .select('*')
          .order('name');

        if (error) throw error;
        this.customLabels = data;
      } catch (error: any) {
        this.error = error.message;
        toast.error('Failed to fetch labels');
      } finally {
        this.loading = false;
      }
    },

    async addLabel(name: string) {
      try {
        const authStore = useAuthStore();
        if (!authStore.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('custom_labels')
          .insert({ 
            name,
            user_id: authStore.user.id 
          })
          .select()
          .single();

        if (error) throw error;
        this.customLabels.push(data);
        toast.success('Label added successfully');
      } catch (error: any) {
        if (error.code === '23505') {
          toast.error('Label already exists');
        } else {
          toast.error('Failed to add label');
        }
        throw error;
      }
    },

    async deleteLabel(id: string) {
      try {
        const { error } = await supabase
          .from('custom_labels')
          .delete()
          .eq('id', id);

        if (error) throw error;
        this.customLabels = this.customLabels.filter(l => l.id !== id);
        toast.success('Label deleted successfully');
      } catch (error: any) {
        toast.error('Failed to delete label');
        throw error;
      }
    }
  }
});