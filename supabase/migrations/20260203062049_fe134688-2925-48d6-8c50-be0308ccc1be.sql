-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    admission_number TEXT,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student_parents junction table (a student can have multiple parents/guardians)
CREATE TABLE public.student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'parent' CHECK (relationship IN ('parent', 'guardian', 'other')),
    is_primary_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, parent_id)
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "School admins can manage students"
    ON public.students FOR ALL
    USING (has_school_role(auth.uid(), 'school_admin', school_id));

CREATE POLICY "Teachers can view students in their school"
    ON public.students FOR SELECT
    USING (has_school_role(auth.uid(), 'teacher', school_id));

CREATE POLICY "Parents can view their linked students"
    ON public.students FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_parents sp
            WHERE sp.student_id = students.id
            AND sp.parent_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own record"
    ON public.students FOR SELECT
    USING (user_id = auth.uid());

-- RLS Policies for student_parents
CREATE POLICY "School admins can manage student-parent links"
    ON public.student_parents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = student_parents.student_id
            AND has_school_role(auth.uid(), 'school_admin', s.school_id)
        )
    );

CREATE POLICY "Parents can view their own links"
    ON public.student_parents FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Teachers can view student-parent links in their school"
    ON public.student_parents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = student_parents.student_id
            AND has_school_role(auth.uid(), 'teacher', s.school_id)
        )
    );

-- Indexes for performance
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_class_id ON public.students(class_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_student_parents_student_id ON public.student_parents(student_id);
CREATE INDEX idx_student_parents_parent_id ON public.student_parents(parent_id);

-- Trigger for updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();