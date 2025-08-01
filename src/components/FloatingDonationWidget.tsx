import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";

const FloatingDonationWidget = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const scrollToDonation = () => {
    const donationSection = document.querySelector('[data-donation-section]');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="icon"
        >
          <Heart className="w-8 h-8 text-primary-foreground group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-border p-4 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Support Mental Health</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
          Your donation helps provide accessible mental health services to our community.
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={scrollToDonation}
            className="w-full text-sm bg-primary hover:bg-primary/90"
          >
            View Donation Details
          </Button>
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
            <span>P500 • P1,500 • P5,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingDonationWidget;