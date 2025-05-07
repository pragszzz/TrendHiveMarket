import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart3, TrendingUp, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UseQueryOptions } from "@tanstack/react-query";

// Define the trend analysis response structure
interface TrendAnalysisResponse {
  trendingCategories: string[];
  trendingColors: string[];
  trendingStyles: string[];
  consumerInsights: string;
  recommendations: {
    forUsers: string;
    forInventory: string;
  };
}

export default function TrendAnalysisPage() {
  const { toast } = useToast();
  
  const { data: trendAnalysis, isLoading, error } = useQuery<TrendAnalysisResponse, Error>({
    queryKey: ["/api/trends"],
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading trend analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-3xl mx-auto text-center px-4">
        <div className="bg-destructive/10 p-6 rounded-lg mb-4 text-destructive">
          <p className="text-lg font-medium">Unable to load trend analysis</p>
          <p>Our AI-powered trend analysis is currently unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-10 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Fashion Trend Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered insights into current fashion trends, consumer behavior, and recommendations for 
          your style choices based on real-time market data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Categories
            </CardTitle>
            <CardDescription>
              Top product categories gaining popularity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendAnalysis?.trendingCategories.map((category, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Trending Colors
            </CardTitle>
            <CardDescription>
              Color palettes gaining traction this season
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendAnalysis?.trendingColors.map((color, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                  {color}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Trending Styles
            </CardTitle>
            <CardDescription>
              Fashion styles on the rise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendAnalysis?.trendingStyles.map((style, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                  {style}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Consumer Insights</CardTitle>
          <CardDescription>
            What consumers are looking for in fashion today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {trendAnalysis?.consumerInsights}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations for You</CardTitle>
            <CardDescription>
              Style suggestions based on current trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {trendAnalysis?.recommendations.forUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Insights</CardTitle>
            <CardDescription>
              What retailers are stocking up on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {trendAnalysis?.recommendations.forInventory}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-12">
        <p>
          Analysis generated using AI technology based on current fashion data.
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}