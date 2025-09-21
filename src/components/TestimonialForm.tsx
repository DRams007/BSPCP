import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit testimonial');
      }

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
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
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
                        aria-label={`${star} star rating`}
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
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => handleInputChange("anonymous", e.target.checked)}
                    className="rounded border-border"
                    aria-label="Submit anonymously"
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (your name will not be displayed)
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
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
