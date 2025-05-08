import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Product, Wishlist } from "@shared/schema.ts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, Heart, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  
  // Fetch user's wishlist
  const { data: wishlist } = useQuery<Wishlist>({
    queryKey: ["/api/wishlist"],
    enabled: !!user && open,
  });
  
  // Check if product is in wishlist
  const isInWishlist = product ? (wishlist && Array.isArray(wishlist.productIds) && wishlist.productIds.includes(product.id) || false) : false;
  
  // Reset selections when modal opens with a different product
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0]?.name || "");
    }
  }, [product]);
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) return null;
      
      const res = await apiRequest("POST", "/api/cart/add", {
        productId: product.id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });
  
  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) return null;
      
      const res = await apiRequest("POST", "/api/wishlist/toggle", { productId: product.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist 
          ? "Item has been removed from your wishlist" 
          : "Item has been added to your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });
  
  const handleAddToCart = () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      toast({
        title: "Please login",
        description: "You need to login to add items to your cart",
      });
      return;
    }
    
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "You need to select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedColor && product?.colors.length) {
      toast({
        title: "Please select a color",
        description: "You need to select a color before adding to cart",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };
  
  const handleToggleWishlist = () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      toast({
        title: "Please login",
        description: "You need to login to add items to your wishlist",
      });
      return;
    }
    
    toggleWishlistMutation.mutate();
  };
  
  const handleViewDetails = () => {
    if (product) {
      onOpenChange(false);
      navigate(`/product/${product.id}`);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-playfair text-xl font-medium">Quick View</DialogTitle>
            <DialogClose className="text-[#666666] hover:text-[#333333]">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-[#F7F8FA] rounded-lg overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Product Info */}
            <div>
              <h3 className="text-xl font-medium mb-2">{product.title}</h3>
              <div className="flex items-center mb-4">
                <div className="flex text-[#A0AEC0]">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const rating = product.rating || 0;
                    if (idx < Math.floor(rating)) {
                      return <Star key={idx} className="h-4 w-4 fill-[#A0AEC0] text-[#A0AEC0]" />;
                    } else if (idx === Math.floor(rating) && rating % 1 !== 0) {
                      return <StarHalf key={idx} className="h-4 w-4 fill-[#A0AEC0] text-[#A0AEC0]" />;
                    } else {
                      return <Star key={idx} className="h-4 w-4 text-[#A0AEC0]" />;
                    }
                  })}
                </div>
                <span className="ml-2 text-[#666666] text-sm">{product.rating || 0} ({product.reviewCount || 0} reviews)</span>
              </div>
              
              <div className="mb-4">
                <span className="text-xl font-medium">${(product.price / 100).toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="ml-3 text-[#666666] line-through text-lg">
                    ${(product.originalPrice / 100).toFixed(2)}
                  </span>
                )}
              </div>
              
              <p className="text-[#666666] mb-6">
                {product.description}
              </p>
              
              {/* Quick Size Selection */}
              <div className="mb-6">
                <span className="font-medium block mb-2">Size</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button 
                      key={size}
                      className={`px-3 py-1.5 border rounded-md transition ${
                        selectedSize === size 
                          ? 'bg-[#E8E4DD] border-[#333333]' 
                          : 'border-[#EBEDF0] hover:border-[#C6C9D2]'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quick Color Selection */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="font-medium block mb-2">Color</span>
                  <div className="flex space-x-3">
                    {product.colors.map((color) => (
                      <button 
                        key={color.name}
                        className={`w-8 h-8 rounded-full transition ${
                          selectedColor === color.name 
                            ? 'outline outline-2 outline-[#333333] outline-offset-2' 
                            : ''
                        }`}
                        style={{ backgroundColor: color.code }}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-[#333333] hover:bg-black"
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  className="py-3 px-4 border-[#333333]"
                  onClick={handleToggleWishlist}
                  disabled={toggleWishlistMutation.isPending}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-[#333333]' : ''}`} />
                </Button>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="link" 
                  className="text-[#333333] hover:underline font-medium p-0"
                  onClick={handleViewDetails}
                >
                  View Full Details
                  <span className="ml-1">→</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
