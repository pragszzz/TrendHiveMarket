import { useState } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Loader2, ShoppingBag, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

// Define the personalized recommendations response structure
interface ProductRecommendation {
  productId: number;
  title: string;
  reason: string;
  score: number;
}

export default function PersonalizedRecommendationsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  
  const { data: recommendations, isLoading, error } = useQuery<ProductRecommendation[], Error>({
    queryKey: ["/api/recommendations/personalized"],
    retry: 1,
    enabled: !!user, // Only run the query if the user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!user) {
    return (
      <div className="container max-w-7xl py-10 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Personalized Recommendations</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please log in to view your personalized product recommendations.
          </p>
          <Button asChild className="mt-6">
            <Link href="/auth">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your personalized recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-3xl mx-auto text-center px-4">
        <div className="bg-destructive/10 p-6 rounded-lg mb-4 text-destructive">
          <p className="text-lg font-medium">Unable to load recommendations</p>
          <p>Our AI-powered recommendation system is currently unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: number) => {
    try {
      setIsAddingToCart(productId);
      
      // Mock defaults for size and color
      const data = {
        productId,
        quantity: 1,
        size: "M",
        color: "Default"
      };
      
      await apiRequest("POST", "/api/cart/add", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(null);
    }
  };

  return (
    <div className="container max-w-7xl py-10 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Your Personalized Recommendations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-curated product recommendations based on your unique style preferences, purchase history, and browsing behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations?.map((recommendation: ProductRecommendation) => (
          <Card key={recommendation.productId} className="flex flex-col h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{Math.round(recommendation.score) / 10}/10</span>
                </div>
              </div>
              <CardDescription>Match score: {recommendation.score}%</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {recommendation.reason}
              </p>
            </CardContent>
            <CardFooter className="flex gap-3 pt-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/products/${recommendation.productId}`}>
                  View Details
                </Link>
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleAddToCart(recommendation.productId)}
                disabled={isAddingToCart === recommendation.productId}
              >
                {isAddingToCart === recommendation.productId ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingBag className="h-4 w-4 mr-2" />
                )}
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {recommendations && recommendations.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            We don't have enough data yet to provide personalized recommendations.
            Keep browsing and shopping to help our AI better understand your preferences.
          </p>
        </div>
      )}
    </div>
  );
}