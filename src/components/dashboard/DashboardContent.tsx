import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

type AppRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student' | null;

interface DashboardContentProps {
  role: AppRole;
}

export function DashboardContent({ role }: DashboardContentProps) {
  const { profile } = useAuth();

  const renderWelcome = () => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
      </h1>
      <p className="text-muted-foreground mt-1">
        Here's what's happening in your {role === 'super_admin' ? 'platform' : 'school'} today.
      </p>
    </div>
  );

  const renderSuperAdminDashboard = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Schools"
          value="127"
          change="+12 this month"
          icon={Building2}
          trend="up"
        />
        <StatCard
          title="Total Users"
          value="45,231"
          change="+2,345 this month"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Sessions"
          value="8,432"
          change="Live now"
          icon={TrendingUp}
          trend="neutral"
        />
        <StatCard
          title="System Health"
          value="99.9%"
          change="All systems operational"
          icon={CheckCircle2}
          trend="up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent School Registrations</CardTitle>
            <CardDescription>Schools that joined in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Springfield Elementary', 'Oak Valley High', 'Riverside Academy'].map((school) => (
                <div key={school} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{school}</div>
                    <div className="text-sm text-muted-foreground">Joined 2 days ago</div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">Active</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <div className="font-medium">High server load detected</div>
                  <div className="text-sm text-muted-foreground">CPU usage above 80% on Node 3</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Clock className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <div className="font-medium">Scheduled maintenance</div>
                  <div className="text-sm text-muted-foreground">Feb 15, 2026 at 2:00 AM UTC</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderSchoolAdminDashboard = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Students"
          value="1,247"
          change="+23 this term"
          icon={GraduationCap}
          trend="up"
        />
        <StatCard
          title="Teachers"
          value="86"
          change="5 on leave"
          icon={Users}
          trend="neutral"
        />
        <StatCard
          title="Classes Today"
          value="42"
          change="8 ongoing now"
          icon={BookOpen}
          trend="neutral"
        />
        <StatCard
          title="Attendance"
          value="96.2%"
          change="+1.3% from last week"
          icon={CheckCircle2}
          trend="up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming events and classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '09:00 AM', event: 'Staff Meeting', location: 'Conference Room A' },
                { time: '11:00 AM', event: 'Parent-Teacher Conference', location: 'Main Hall' },
                { time: '02:00 PM', event: 'Sports Day Planning', location: 'Admin Office' },
              ].map((item) => (
                <div key={item.event} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-primary w-20">{item.time}</div>
                  <div className="flex-1">
                    <div className="font-medium">{item.event}</div>
                    <div className="text-sm text-muted-foreground">{item.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Student', icon: GraduationCap },
                { label: 'Add Teacher', icon: Users },
                { label: 'Create Class', icon: BookOpen },
                { label: 'Send Notice', icon: Calendar },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <action.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="My Students"
          value="156"
          change="Across 4 classes"
          icon={GraduationCap}
          trend="neutral"
        />
        <StatCard
          title="Pending Assignments"
          value="23"
          change="12 due this week"
          icon={BookOpen}
          trend="neutral"
        />
        <StatCard
          title="Today's Classes"
          value="5"
          change="2 completed"
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title="Avg. Attendance"
          value="94.5%"
          change="+2.1% this month"
          icon={CheckCircle2}
          trend="up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Classes</CardTitle>
          <CardDescription>Your teaching schedule for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '08:00 - 09:00', class: 'Mathematics', grade: 'Grade 10A', room: 'Room 201' },
              { time: '09:30 - 10:30', class: 'Mathematics', grade: 'Grade 11B', room: 'Room 202' },
              { time: '11:00 - 12:00', class: 'Statistics', grade: 'Grade 12A', room: 'Room 203' },
            ].map((item) => (
              <div key={`${item.class}-${item.grade}`} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="text-sm font-medium text-primary w-28">{item.time}</div>
                <div className="flex-1">
                  <div className="font-medium">{item.class}</div>
                  <div className="text-sm text-muted-foreground">{item.grade} • {item.room}</div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity">
                  Start Class
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderParentDashboard = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Overall Grade"
          value="A-"
          change="Top 15% of class"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Attendance"
          value="97.2%"
          change="2 absences this term"
          icon={Calendar}
          trend="up"
        />
        <StatCard
          title="Pending Fees"
          value="$450"
          change="Due Feb 28"
          icon={Clock}
          trend="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Children's Progress</CardTitle>
          <CardDescription>Academic performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  JD
                </div>
                <div>
                  <div className="font-semibold">Jane Doe</div>
                  <div className="text-sm text-muted-foreground">Grade 8 • Section A</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">A</div>
                  <div className="text-xs text-muted-foreground">Math</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-secondary">A-</div>
                  <div className="text-xs text-muted-foreground">Science</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-accent">B+</div>
                  <div className="text-xs text-muted-foreground">English</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Current GPA"
          value="3.67"
          change="+0.12 from last term"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Assignments Due"
          value="4"
          change="2 due tomorrow"
          icon={BookOpen}
          trend="neutral"
        />
        <StatCard
          title="Attendance"
          value="97.2%"
          change="Excellent!"
          icon={CheckCircle2}
          trend="up"
        />
        <StatCard
          title="Classes Today"
          value="6"
          change="3 remaining"
          icon={Calendar}
          trend="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: 'Mathematics', title: 'Calculus Problem Set 5', due: 'Tomorrow', priority: 'high' },
                { subject: 'Physics', title: 'Lab Report: Wave Motion', due: 'In 3 days', priority: 'medium' },
                { subject: 'English', title: 'Essay: Climate Change', due: 'In 5 days', priority: 'low' },
              ].map((assignment) => (
                <div key={assignment.title} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                  <div className={`w-2 h-2 rounded-full ${
                    assignment.priority === 'high' ? 'bg-destructive' :
                    assignment.priority === 'medium' ? 'bg-accent' : 'bg-success'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{assignment.title}</div>
                    <div className="text-sm text-muted-foreground">{assignment.subject} • Due {assignment.due}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Smith', room: '201' },
                { time: '09:30 - 10:30', subject: 'Physics', teacher: 'Ms. Johnson', room: '105' },
                { time: '11:00 - 12:00', subject: 'English', teacher: 'Mrs. Davis', room: '302' },
              ].map((cls) => (
                <div key={cls.subject} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-primary w-24">{cls.time}</div>
                  <div className="flex-1">
                    <div className="font-medium">{cls.subject}</div>
                    <div className="text-sm text-muted-foreground">{cls.teacher} • Room {cls.room}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderNewUserDashboard = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to EduManage!</CardTitle>
        <CardDescription>
          Your account is set up. Contact your school administrator to get assigned to your school and receive the appropriate permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Once you're assigned a role, your personalized dashboard will appear here.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {renderWelcome()}
      {role === 'super_admin' && renderSuperAdminDashboard()}
      {role === 'school_admin' && renderSchoolAdminDashboard()}
      {role === 'teacher' && renderTeacherDashboard()}
      {role === 'parent' && renderParentDashboard()}
      {role === 'student' && renderStudentDashboard()}
      {!role && renderNewUserDashboard()}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="text-3xl font-bold">{value}</div>
        <div className={`text-sm mt-1 ${
          trend === 'up' ? 'text-success' : 
          trend === 'down' ? 'text-destructive' : 
          'text-muted-foreground'
        }`}>
          {change}
        </div>
      </CardContent>
    </Card>
  );
}
