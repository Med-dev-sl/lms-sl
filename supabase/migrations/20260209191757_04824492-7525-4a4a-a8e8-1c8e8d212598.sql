
-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Indexes
CREATE INDEX idx_attendance_school_id ON public.attendance(school_id);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_class_id ON public.attendance(class_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_class_date ON public.attendance(class_id, date);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- School admins can manage all attendance in their school
CREATE POLICY "School admins can manage attendance"
ON public.attendance
FOR ALL
USING (has_school_role(auth.uid(), 'school_admin'::app_role, school_id));

-- Teachers can manage attendance in their school
CREATE POLICY "Teachers can manage attendance"
ON public.attendance
FOR ALL
USING (has_school_role(auth.uid(), 'teacher'::app_role, school_id));

-- Parents can view attendance of their linked students
CREATE POLICY "Parents can view their children attendance"
ON public.attendance
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.student_parents sp
  WHERE sp.student_id = attendance.student_id
  AND sp.parent_id = auth.uid()
));

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
ON public.attendance
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = attendance.student_id
  AND s.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
