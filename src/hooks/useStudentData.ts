import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// Types
export interface Student {
  id: string;
  school_id: string;
  class_id: string | null;
  user_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  admission_number: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  classes?: { name: string; grade_level: string } | null;
}

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  relationship: 'parent' | 'guardian' | 'other';
  is_primary_contact: boolean;
  created_at: string;
  profiles?: { full_name: string; email: string } | null;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  class_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  admission_number?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: string;
  status?: 'active' | 'inactive' | 'graduated' | 'transferred';
}

// Students hooks
export function useStudents(classId?: string) {
  const { schoolId } = useAuth();
  
  return useQuery({
    queryKey: ['students', schoolId, classId],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          *,
          classes(name, grade_level)
        `)
        .eq('school_id', schoolId!)
        .order('last_name', { ascending: true });
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!schoolId,
  });
}

export function useStudent(studentId: string) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes(name, grade_level)
        `)
        .eq('id', studentId)
        .single();
      
      if (error) throw error;
      return data as Student;
    },
    enabled: !!studentId,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const { data: result, error } = await supabase
        .from('students')
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
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student enrolled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll student');
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateStudentData) => {
      const { error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update student');
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove student');
    },
  });
}

// Student-Parent linking hooks
export function useStudentParents(studentId: string) {
  return useQuery({
    queryKey: ['student-parents', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          *,
          profiles:parent_id(full_name, email)
        `)
        .eq('student_id', studentId);
      
      if (error) throw error;
      return data as StudentParent[];
    },
    enabled: !!studentId,
  });
}

export function useLinkParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      parent_id: string;
      relationship?: 'parent' | 'guardian' | 'other';
      is_primary_contact?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from('student_parents')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-parents', variables.student_id] });
      toast.success('Parent linked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to link parent');
    },
  });
}

export function useUnlinkParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      const { error } = await supabase
        .from('student_parents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return studentId;
    },
    onSuccess: (studentId) => {
      queryClient.invalidateQueries({ queryKey: ['student-parents', studentId] });
      toast.success('Parent unlinked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlink parent');
    },
  });
}

// Get parents in school (for linking dropdown)
export function useSchoolParents() {
  const { schoolId } = useAuth();
  
  return useQuery({
    queryKey: ['school-parents', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('school_id', schoolId!);
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });
}
