import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TestimonialForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    content: "",
    rating: 5,
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Thank you for your testimonial!",
        description: "Your testimonial has been submitted and will be reviewed before publication.",
      });
      setFormData({
        name: "",
        email: "",
        role: "",
        content: "",
        rating: 5,
        anonymous: false
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 bg-muted/20" id="testimonial-form">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Share Your Experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Help others by sharing your journey with BSPCP. Your story matters and can inspire others to seek help.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/10">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> To submit testimonials and have them saved permanently, this site needs to be connected to a database. 
              Currently, testimonials are only displayed temporarily for demonstration.
            </AlertDescription>
          </Alert>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Submit Your Testimonial</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Your Role/Relationship</Label>
                  <Select onValueChange={(value) => handleInputChange("role", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="family-member">Family Member</SelectItem>
                      <SelectItem value="individual-therapy">Individual Therapy Client</SelectItem>
                      <SelectItem value="family-therapy">Family Therapy Client</SelectItem>
                      <SelectItem value="couples-counselling">Couples Counselling Client</SelectItem>
                      <SelectItem value="online-counselling">Online Counselling Client</SelectItem>
                      <SelectItem value="community-partner">Community Partner</SelectItem>
                      <SelectItem value="healthcare-professional">Healthcare Professional</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Your Rating</Label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleInputChange("rating", star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          } hover:scale-110 transition-transform`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.rating} star{formData.rating !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Your Testimonial</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Share your experience with BSPCP. How did our services help you? What would you tell others considering our services?"
                    rows={5}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 50 characters. Please be respectful and honest in your review.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => handleInputChange("anonymous", e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (your name will not be displayed)
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || formData.content.length < 50}
                >
                  {isSubmitting ? "Submitting..." : "Submit Testimonial"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  All testimonials are reviewed before publication. We reserve the right to edit for length and clarity while maintaining the original message.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TestimonialForm;