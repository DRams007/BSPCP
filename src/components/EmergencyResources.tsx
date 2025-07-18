import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Clock, AlertTriangle } from 'lucide-react';

const EmergencyResources = () => {
  const emergencyContacts = [
    {
      name: 'Emergency Services',
      number: '997',
      description: 'Police, Fire, Medical emergencies',
      icon: Phone,
      available: '24/7'
    },
    {
      name: 'Crisis Helpline',
      number: '16222',
      description: 'Mental health crisis support',
      icon: MessageCircle,
      available: '24/7'
    },
    {
      name: 'Suicide Prevention',
      number: '3905050',
      description: 'Immediate suicide prevention help',
      icon: AlertTriangle,
      available: '24/7'
    }
  ];

  return (
    <section className="py-16 bg-destructive/5 border-t-4 border-destructive">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-4">
            Emergency Resources
          </h2>
          <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
            If you're experiencing a mental health emergency or crisis, immediate help is available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {emergencyContacts.map((contact, index) => (
            <Card key={index} className="border-destructive/20 bg-background">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <contact.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  {contact.name}
                </h3>
                <div className="font-poppins font-bold text-2xl text-destructive mb-2">
                  {contact.number}
                </div>
                <p className="font-source text-sm text-muted-foreground mb-3">
                  {contact.description}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{contact.available}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="font-source text-sm text-muted-foreground mb-4">
            If you're in immediate danger, please call emergency services or go to your nearest hospital.
          </p>
          <Button 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            View All Emergency Resources
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EmergencyResources;