import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface SchoolUser {
  id: string;
  role: string;
  user_id: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

export function useSchoolUsers(role?: string) {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ['school-users', schoolId, role],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-school-users', {
        body: { action: 'list_users', school_id: schoolId, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.users || []) as SchoolUser[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateSchoolUser() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (data: { email: string; password: string; full_name: string; role: string }) => {
      const { data: result, error } = await supabase.functions.invoke('manage-school-users', {
        body: { action: 'create_user', school_id: schoolId, ...data },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] });
      toast.success(`${variables.role.charAt(0).toUpperCase() + variables.role.slice(1)} added successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add user');
    },
  });
}

export function useDeleteSchoolUser() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: result, error } = await supabase.functions.invoke('manage-school-users', {
        body: { action: 'delete_user', user_id: userId, school_id: schoolId },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] });
      toast.success('User removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove user');
    },
  });
}
