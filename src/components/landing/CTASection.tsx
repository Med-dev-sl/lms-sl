import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const benefits = [
  'Free 30-day trial',
  'No credit card required',
  'Full feature access',
  'Dedicated support',
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-foreground/5 rounded-full blur-3xl" />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your School?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join hundreds of schools already using EduManage to streamline their 
              operations and improve educational outcomes.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm"
                >
                  <Check className="h-4 w-4" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="shadow-elevated">
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
