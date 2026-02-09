import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import Classes from './Classes';
import Subjects from './Subjects';
import Timetable from './Timetable';
import Students from './Students';
import Attendance from './Attendance';

export default function Dashboard() {
  const { user, isLoading, getPrimaryRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = getPrimaryRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-muted/30">
            <Routes>
              <Route index element={<DashboardContent role={role} />} />
              <Route path="classes" element={<Classes />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="students" element={<Students />} />
              <Route path="attendance" element={<Attendance />} />
              {/* Placeholder routes for other sections */}
              <Route path="*" element={<DashboardContent role={role} />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
