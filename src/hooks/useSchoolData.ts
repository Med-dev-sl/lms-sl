import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// Types
export interface Class {
  id: string;
  school_id: string;
  name: string;
  grade_level: string;
  section: string | null;
  academic_year: string;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  classes?: { name: string; grade_level: string };
  subjects?: { name: string; code: string; color: string };
  profiles?: { full_name: string };
}

// Classes hooks
export function useClasses() {
  const { schoolId } = useAuth();
  
  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId!)
        .order('grade_level', { ascending: true });
      
      if (error) throw error;
      return data as Class[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { name: string; grade_level: string; section?: string; academic_year?: string }) => {
      const { data: result, error } = await supabase
        .from('classes')
        .insert({
          ...data,
          school_id: schoolId!,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create class');
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; grade_level?: string; section?: string; is_active?: boolean }) => {
      const { error } = await supabase
        .from('classes')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update class');
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete class');
    },
  });
}

// Subjects hooks
export function useSubjects() {
  const { schoolId } = useAuth();
  
  return useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId!)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { name: string; code: string; description?: string; color?: string }) => {
      const { data: result, error } = await supabase
        .from('subjects')
        .insert({
          ...data,
          school_id: schoolId!,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create subject');
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; code?: string; description?: string; color?: string; is_active?: boolean }) => {
      const { error } = await supabase
        .from('subjects')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject');
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subject');
    },
  });
}

// Timetable hooks
export function useTimetable(classId?: string) {
  const { schoolId } = useAuth();
  
  return useQuery({
    queryKey: ['timetable', schoolId, classId],
    queryFn: async () => {
      let query = supabase
        .from('timetable_entries')
        .select(`
          *,
          classes(name, grade_level),
          subjects(name, code, color),
          profiles:teacher_id(full_name)
        `)
        .eq('school_id', schoolId!)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TimetableEntry[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      class_id: string;
      subject_id: string;
      teacher_id?: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      room?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('timetable_entries')
        .insert({
          ...data,
          school_id: schoolId!,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create timetable entry');
    },
  });
}

export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      class_id?: string;
      subject_id?: string;
      teacher_id?: string | null;
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      room?: string;
    }) => {
      const { error } = await supabase
        .from('timetable_entries')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update timetable entry');
    },
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('timetable_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete timetable entry');
    },
  });
}
