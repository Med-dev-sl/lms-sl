import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  Building2,
  UserCog,
  BarChart3,
  MessageSquare,
  CreditCard,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { NavLink } from '@/components/NavLink';

type AppRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student';

const menuItems: Record<AppRole, { title: string; url: string; icon: React.ElementType }[]> = {
  super_admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Schools', url: '/dashboard/schools', icon: Building2 },
    { title: 'All Users', url: '/dashboard/users', icon: Users },
    { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ],
  school_admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Staff', url: '/dashboard/staff', icon: UserCog },
    { title: 'Students', url: '/dashboard/students', icon: GraduationCap },
    { title: 'Parents', url: '/dashboard/parents', icon: Users },
    { title: 'Classes', url: '/dashboard/classes', icon: BookOpen },
    { title: 'Subjects', url: '/dashboard/subjects', icon: FileText },
    { title: 'Timetable', url: '/dashboard/timetable', icon: Calendar },
    { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
    { title: 'Fees', url: '/dashboard/fees', icon: CreditCard },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ],
  teacher: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Classes', url: '/dashboard/classes', icon: BookOpen },
    { title: 'Students', url: '/dashboard/students', icon: GraduationCap },
    { title: 'Assignments', url: '/dashboard/assignments', icon: FileText },
    { title: 'Attendance', url: '/dashboard/attendance', icon: Calendar },
    { title: 'Messages', url: '/dashboard/messages', icon: MessageSquare },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ],
  parent: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Children', url: '/dashboard/children', icon: Users },
    { title: 'Progress', url: '/dashboard/progress', icon: BarChart3 },
    { title: 'Attendance', url: '/dashboard/attendance', icon: Calendar },
    { title: 'Messages', url: '/dashboard/messages', icon: MessageSquare },
    { title: 'Fees', url: '/dashboard/fees', icon: CreditCard },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ],
  student: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Courses', url: '/dashboard/courses', icon: BookOpen },
    { title: 'Assignments', url: '/dashboard/assignments', icon: FileText },
    { title: 'Grades', url: '/dashboard/grades', icon: BarChart3 },
    { title: 'Schedule', url: '/dashboard/schedule', icon: Calendar },
    { title: 'Messages', url: '/dashboard/messages', icon: MessageSquare },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ],
};

export function DashboardSidebar() {
  const { getPrimaryRole, profile } = useAuth();
  const location = useLocation();
  const role = getPrimaryRole() || 'student';
  const items = menuItems[role];

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span>EduManage</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {role === 'super_admin' && 'Platform Management'}
            {role === 'school_admin' && 'School Management'}
            {role === 'teacher' && 'Teaching Tools'}
            {role === 'parent' && 'Parent Portal'}
            {role === 'student' && 'Student Portal'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="flex items-center gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-medium">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || 'User'}
            </div>
            <div className="text-xs text-sidebar-foreground/60 capitalize">
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
