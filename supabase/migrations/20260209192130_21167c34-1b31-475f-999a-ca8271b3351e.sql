
-- Fix infinite recursion: attendance policies reference students, 
-- which has policies referencing student_parents, which references students.
-- Solution: Use SECURITY DEFINER functions to bypass RLS checks.

-- Function to check if a student belongs to a parent
CREATE OR REPLACE FUNCTION public.is_parent_of_student(_parent_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_parents
    WHERE parent_id = _parent_id AND student_id = _student_id
  )
$$;

-- Function to check if a student has a specific user_id
CREATE OR REPLACE FUNCTION public.is_student_user(_user_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = _student_id AND user_id = _user_id
  )
$$;

-- Drop the problematic attendance policies
DROP POLICY IF EXISTS "Parents can view their children attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;

-- Recreate with SECURITY DEFINER functions to avoid recursion
CREATE POLICY "Parents can view their children attendance"
ON public.attendance
FOR SELECT
USING (is_parent_of_student(auth.uid(), student_id));

CREATE POLICY "Students can view own attendance"
ON public.attendance
FOR SELECT
USING (is_student_user(auth.uid(), student_id));

-- Also fix the students table policies that may cause recursion
DROP POLICY IF EXISTS "Parents can view their linked students" ON public.students;
CREATE POLICY "Parents can view their linked students"
ON public.students
FOR SELECT
USING (is_parent_of_student(auth.uid(), id));
