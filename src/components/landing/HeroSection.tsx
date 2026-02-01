import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Users, BookOpen } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-surface py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              Trusted by 500+ Schools Worldwide
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Modern School
              <span className="text-gradient-primary block">Management System</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Empower your school with a comprehensive platform that connects administrators, 
              teachers, students, and parents in one secure, easy-to-use system.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-gradient-hero hover:opacity-90 shadow-glow">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-hero border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold">50,000+ Users</div>
                <div className="text-muted-foreground">Active this month</div>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10 bg-card rounded-2xl shadow-elevated p-6 animate-fade-up">
              {/* Dashboard preview card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Quick Overview</h3>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-primary/10 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-primary">1,247</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <div className="text-2xl font-bold text-secondary">86</div>
                    <div className="text-xs text-muted-foreground">Classes</div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold text-accent">98%</div>
                    <div className="text-xs text-muted-foreground">Attendance</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm">Parent meeting scheduled - Grade 5</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">Exam results ready for review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-elevated p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Enterprise Security</div>
                  <div className="text-xs text-muted-foreground">SOC 2 Type II Certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
