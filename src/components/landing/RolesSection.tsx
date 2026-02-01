import { Shield, GraduationCap, Users2, BookUser, Baby } from 'lucide-react';

const roles = [
  {
    icon: Shield,
    title: 'Super Admin',
    description: 'Platform-wide control over all schools, users, and system settings.',
    features: ['Manage all schools', 'Platform analytics', 'System configuration', 'Global announcements'],
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: GraduationCap,
    title: 'School Admin',
    description: 'Complete management of your school operations and staff.',
    features: ['Staff management', 'Course setup', 'Fee management', 'School reports'],
    gradient: 'from-secondary to-secondary/70',
  },
  {
    icon: BookUser,
    title: 'Teachers',
    description: 'Tools to manage classes, assignments, and student progress.',
    features: ['Class management', 'Grade assignments', 'Attendance tracking', 'Parent communication'],
    gradient: 'from-accent to-accent/70',
  },
  {
    icon: Users2,
    title: 'Parents',
    description: 'Stay connected with your child\'s education and school activities.',
    features: ['Progress monitoring', 'Teacher messaging', 'Fee payments', 'Event calendar'],
    gradient: 'from-success to-success/70',
  },
  {
    icon: Baby,
    title: 'Students',
    description: 'Access learning materials, submit assignments, and track progress.',
    features: ['Course materials', 'Submit assignments', 'View grades', 'Class schedule'],
    gradient: 'from-primary to-secondary',
  },
];

export function RolesSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tailored for Every Role
          </h2>
          <p className="text-lg text-muted-foreground">
            Each user gets a personalized experience with features designed specifically 
            for their needs and responsibilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className={`relative overflow-hidden rounded-2xl bg-card border border-border p-6 ${
                index === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.gradient} opacity-10 blur-2xl`} />
              
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} mb-4`}>
                  <role.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                <p className="text-muted-foreground mb-4">{role.description}</p>
                
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
