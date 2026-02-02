-- Create classes table (e.g., Grade 5A, Grade 10B)
CREATE TABLE public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    section TEXT,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(school_id, name, academic_year)
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(school_id, code)
);

-- Create class_subjects junction table (which subjects are taught in which class)
CREATE TABLE public.class_subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(class_id, subject_id)
);

-- Create timetable entries
CREATE TABLE public.timetable_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Classes policies
CREATE POLICY "Users can view classes in their school"
ON public.classes FOR SELECT
USING (school_id = get_user_school_id(auth.uid()));

CREATE POLICY "School admins can manage classes"
ON public.classes FOR ALL
USING (has_school_role(auth.uid(), 'school_admin', school_id));

-- Subjects policies
CREATE POLICY "Users can view subjects in their school"
ON public.subjects FOR SELECT
USING (school_id = get_user_school_id(auth.uid()));

CREATE POLICY "School admins can manage subjects"
ON public.subjects FOR ALL
USING (has_school_role(auth.uid(), 'school_admin', school_id));

-- Class subjects policies
CREATE POLICY "Users can view class subjects in their school"
ON public.class_subjects FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.classes c 
        WHERE c.id = class_id 
        AND c.school_id = get_user_school_id(auth.uid())
    )
);

CREATE POLICY "School admins can manage class subjects"
ON public.class_subjects FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.classes c 
        WHERE c.id = class_id 
        AND has_school_role(auth.uid(), 'school_admin', c.school_id)
    )
);

-- Timetable entries policies
CREATE POLICY "Users can view timetable in their school"
ON public.timetable_entries FOR SELECT
USING (school_id = get_user_school_id(auth.uid()));

CREATE POLICY "School admins can manage timetable"
ON public.timetable_entries FOR ALL
USING (has_school_role(auth.uid(), 'school_admin', school_id));

-- Add update triggers
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_entries_updated_at
BEFORE UPDATE ON public.timetable_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_classes_school_id ON public.classes(school_id);
CREATE INDEX idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX idx_timetable_school_class ON public.timetable_entries(school_id, class_id);
CREATE INDEX idx_timetable_day_time ON public.timetable_entries(day_of_week, start_time);