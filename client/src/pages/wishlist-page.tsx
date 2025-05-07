import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash, ShoppingBag, MoveRight } from "lucide-react";

export default function WishlistPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch wishlist
  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ["/api/wishlist"],
  });
  
  // Fetch products for all items in wishlist
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!wishlist?.productIds?.length,
  });
  
  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("POST", "/api/wishlist/toggle", { productId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
        variant: "destructive",
      });
    },
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, size, color }: { productId: number, size: string, color: string }) => {
      const res = await apiRequest("POST", "/api/cart/add", {
        productId,
        quantity: 1,
        size,
        color,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });
  
  // Get wishlisted products
  const wishlistProducts = products?.filter(
    product => wishlist?.productIds.includes(product.id)
  ) || [];
  
  // Loading state
  const isLoading = wishlistLoading || productsLoading;
  
  // Empty wishlist state
  const isEmpty = !isLoading && wishlistProducts.length === 0;
  
  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate({
      productId: product.id,
      size: product.sizes[0],
      color: product.colors[0]?.name || "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <h1 className="font-playfair text-3xl font-medium mb-8">Your Wishlist</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <Skeleton className="aspect-[3/4] rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F8FA] rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-[#A0AEC0]" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-[#666666] mb-6">Looks like you haven't saved any products yet.</p>
          <Button 
            onClick={() => navigate("/products")}
            className="bg-[#333333] hover:bg-black"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <Card key={product.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  {/* Product image */}
                  <div 
                    className="aspect-[3/4] relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <button 
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm hover:bg-[#F7F8FA] transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlistMutation.mutate(product.id);
                      }}
                      disabled={removeFromWishlistMutation.isPending}
                    >
                      <Trash className="h-4 w-4 text-[#666666]" />
                    </button>
                  </div>
                  
                  {/* Product info */}
                  <div className="p-4">
                    <h3 
                      className="font-medium mb-1 cursor-pointer hover:text-[#A0AEC0]"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.title}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">${(product.price / 100).toFixed(2)}</span>
                      <div className="flex text-xs text-[#A0AEC0]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`h-3 w-3 ${idx < product.rating ? 'fill-[#A0AEC0]' : ''}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#333333] hover:bg-black"
                      onClick={() => handleAddToCart(product)}
                      disabled={addToCartMutation.isPending}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              className="px-6"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
