import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      
      toast({
        title: "Subscription successful",
        description: "Thank you for subscribing to our newsletter!",
      });
    }, 1000);
  };

  return (
    <section className="container mx-auto px-4 py-12 mb-16">
      <div className="bg-[#E8E4DD] rounded-xl py-12 px-6 md:px-12 text-center">
        <h2 className="font-playfair text-2xl md:text-3xl font-medium mb-4">Join Our Community</h2>
        <p className="text-[#666666] max-w-2xl mx-auto mb-8">
          Subscribe to our newsletter for exclusive access to new arrivals, styling tips, and special offers.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto space-y-4 sm:space-y-0 sm:space-x-4">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow py-3 px-4 rounded-md border border-[#EBEDF0]"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            className="py-3 px-6 bg-[#333333] hover:bg-black text-white rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
