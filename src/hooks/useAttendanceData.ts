import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
  students?: { first_name: string; last_name: string; admission_number: string | null } | null;
}

export interface AttendanceEntry {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

// Fetch attendance for a class on a specific date
export function useClassAttendance(classId: string | undefined, date: string) {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students(first_name, last_name, admission_number)
        `)
        .eq('class_id', classId!)
        .eq('date', date);

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!classId && !!date && !!schoolId,
  });
}

// Bulk mark attendance for a class
export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { schoolId, user } = useAuth();

  return useMutation({
    mutationFn: async ({ classId, date, entries }: { classId: string; date: string; entries: AttendanceEntry[] }) => {
      const rows = entries.map(e => ({
        school_id: schoolId!,
        class_id: classId,
        student_id: e.student_id,
        date,
        status: e.status,
        notes: e.notes || null,
        marked_by: user?.id || null,
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(rows, { onConflict: 'student_id,date' });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.classId, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['attendance-report'] });
      toast.success('Attendance saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save attendance');
    },
  });
}

// Weekly attendance report for a class
export function useWeeklyAttendanceReport(classId: string | undefined, weekStart: string, weekEnd: string) {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ['attendance-report', classId, weekStart, weekEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students(first_name, last_name, admission_number)
        `)
        .eq('class_id', classId!)
        .gte('date', weekStart)
        .lte('date', weekEnd)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!classId && !!weekStart && !!weekEnd && !!schoolId,
  });
}
