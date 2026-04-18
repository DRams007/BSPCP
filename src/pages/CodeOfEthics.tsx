import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Users, Heart, Scale, Lock, Eye, BookOpen } from 'lucide-react';

const CodeOfEthics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            BSPCP Code of Ethics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Guiding ethical and professional practice among counsellors and psychotherapists in Botswana
          </p>
        </header>

        <div className="space-y-8">
          {/* Purpose */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">Purpose of the BSPCP Code of Ethics</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The purpose of the BSPCP Code of Ethics is to guide ethical and professional practice among 
                counsellors and psychotherapists in Botswana. The Code aims to protect clients and the public 
                by promoting safe, respectful, and competent services.
              </p>
              <p>
                It defines standards for professional conduct, confidentiality, boundaries, competence, 
                supervision, and accountability. The Code also promotes continuous professional development 
                and responsible self‑care.
              </p>
              <p>
                Furthermore, it provides a basis for ethical review, complaints handling, and disciplinary 
                processes, thereby strengthening public trust and advancing the professionalisation of 
                counselling and psychotherapy in Botswana.
              </p>
            </div>
          </section>

          {/* Core Ethical Principles */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">1. Core Ethical Principles</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Members of BSPCP shall be guided by the following fundamental principles:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.1 Respect for Human Dignity and Rights</h3>
                    <p className="text-muted-foreground">
                      Respect the inherent worth, dignity, and autonomy of all persons.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.2 Beneficence</h3>
                    <p className="text-muted-foreground">
                      Promote the wellbeing of clients and act in their best interests.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.3 Non‑Maleficence</h3>
                    <p className="text-muted-foreground">
                      Avoid causing harm to clients and take steps to minimise foreseeable harm.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.4 Integrity</h3>
                    <p className="text-muted-foreground">
                      Act honestly, responsibly, and transparently in professional relationships.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Scale className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.5 Justice</h3>
                    <p className="text-muted-foreground">
                      Provide fair and equitable services without discrimination.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.6 Professional Responsibility</h3>
                    <p className="text-muted-foreground">
                      Maintain accountability to clients, the profession, and society.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CodeOfEthics;
