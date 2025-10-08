import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Users, Heart, Scale, Lock, Eye } from 'lucide-react';

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
            The ethical guidelines that govern the practice of professional counsellors and psychotherapists 
            in Botswana Society of Professional Counsellors and Psychotherapists
          </p>
        </header>

        <div className="space-y-8">
          {/* Core Principles */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">Core Ethical Principles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Beneficence and Non-maleficence</h3>
                    <p className="text-muted-foreground">Acting in the best interests of clients while avoiding harm</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Respect for Autonomy</h3>
                    <p className="text-muted-foreground">Honoring clients' right to self-determination and informed consent</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Scale className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Justice</h3>
                    <p className="text-muted-foreground">Ensuring fair and equitable treatment for all clients</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Fidelity and Responsibility</h3>
                    <p className="text-muted-foreground">Maintaining trust and professional accountability</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Standards */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Professional Standards</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">1. Competence</h3>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• Maintain current knowledge and skills through continuing professional development</li>
                  <li>• Practice within the boundaries of your competence</li>
                  <li>• Seek supervision and consultation when appropriate</li>
                  <li>• Recognize personal limitations and refer clients when necessary</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">2. Confidentiality</h3>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• Protect client information with strict confidentiality</li>
                  <li>• Obtain explicit consent before sharing information</li>
                  <li>• Understand legal limits to confidentiality</li>
                  <li>• Secure storage and handling of client records</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">3. Informed Consent</h3>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• Provide clear information about the therapeutic process</li>
                  <li>• Explain fees, scheduling, and cancellation policies</li>
                  <li>• Discuss the limits of confidentiality</li>
                  <li>• Ensure clients understand their rights and responsibilities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">4. Dual Relationships</h3>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• Avoid multiple relationships that could impair professional judgment</li>
                  <li>• Maintain appropriate boundaries with clients</li>
                  <li>• Address potential conflicts of interest proactively</li>
                  <li>• Seek consultation when boundary issues arise</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cultural Considerations */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Cultural and Diversity Considerations</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                BSPCP members are committed to providing culturally sensitive and inclusive services that respect 
                the diverse backgrounds of clients in Botswana and beyond.
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Respect cultural, religious, and spiritual beliefs</li>
                <li>• Acknowledge the impact of culture on mental health and healing</li>
                <li>• Develop cultural competence through ongoing education</li>
                <li>• Address personal biases and prejudices</li>
                <li>• Collaborate with traditional healers when appropriate</li>
              </ul>
            </div>
          </section>

          {/* Supervision and Training */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Supervision and Training</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                BSPCP emphasizes the importance of quality supervision and ongoing professional development 
                for all members at every stage of their careers.
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Engage in regular clinical supervision</li>
                <li>• Participate in continuing professional development activities</li>
                <li>• Maintain accurate records of CPD activities</li>
                <li>• Provide ethical supervision to trainees and supervisees</li>
                <li>• Model ethical behavior in all professional interactions</li>
              </ul>
            </div>
          </section>

          {/* Ethical Decision Making */}
          <section className="bg-card rounded-lg p-8 border border-border">
            <div className="flex items-center mb-6">
              <Eye className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">Ethical Decision-Making Process</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>When facing ethical dilemmas, BSPCP members should:</p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Identify the ethical issue and stakeholders involved</li>
                <li>Consult relevant ethical codes and legal requirements</li>
                <li>Consider cultural and contextual factors</li>
                <li>Explore possible courses of action</li>
                <li>Seek consultation with colleagues or supervisors</li>
                <li>Evaluate potential consequences of each option</li>
                <li>Choose and implement the most ethical course of action</li>
                <li>Monitor and evaluate the outcome</li>
              </ol>
            </div>
          </section>


        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CodeOfEthics;
