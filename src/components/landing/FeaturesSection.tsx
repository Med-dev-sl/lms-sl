import { 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  MessageSquare, 
  BarChart3,
  Shield,
  Smartphone 
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Tailored dashboards for admins, teachers, students, and parents with role-based permissions.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BookOpen,
    title: 'Course Management',
    description: 'Create, organize, and deliver courses with assignments, quizzes, and learning materials.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automated timetables, event management, and calendar sync for the entire school.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: FileText,
    title: 'Gradebook & Reports',
    description: 'Comprehensive grading system with automated report cards and progress tracking.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Instant messaging, announcements, and parent-teacher communication in one place.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Data-driven insights on attendance, performance, and school operations.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, GDPR compliance, and role-based access control.',
    color: 'bg-destructive/10 text-destructive',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Access from any device with our responsive design and mobile apps.',
    color: 'bg-accent/10 text-accent',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything Your School Needs
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools designed to streamline school operations 
            and enhance the educational experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
