import { Link, useLocation } from "wouter";
import { Product } from "@shared/schema.ts";
import { Heart, Star, StarHalf } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Import SVG assets for character images
import blossomSvg from "../assets/blossom.svg";
import bubblesSvg from "../assets/bubbles.svg";
import buttercupSvg from "../assets/buttercup.svg";

// Product images are served from public/images

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch user's wishlist
  const { data: wishlist } = useQuery<{productIds: number[]}>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });
  
  // Check if product is in wishlist
  const isInWishlist = Array.isArray(wishlist?.productIds) ? wishlist.productIds.includes(product.id) : false;
  
  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
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
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate("/auth");
      toast({
        title: "Please login",
        description: "You need to login to add items to your wishlist",
      });
      return;
    }
    
    toggleWishlistMutation.mutate();
  };

  // Determine which Powerpuff Girl color to use based on product ID
  const getPowerpuffStyle = () => {
    // Use product ID to assign a color and image
    const id = product.id;
    if (id % 3 === 0) {
      return { 
        bg: "#FF9ED2", 
        text: "#FF7BBF", 
        border: "#FFCCE8",
        character: "Blossom",
        image: blossomSvg
      }; // Blossom
    }
    if (id % 3 === 1) {
      return { 
        bg: "#7BDEFF", 
        text: "#00C3FF", 
        border: "#BBECFF",
        character: "Bubbles",
        image: bubblesSvg
      }; // Bubbles
    }
    return { 
      bg: "#83D475", 
      text: "#5BB04D", 
      border: "#C2F2BB",
      character: "Buttercup",
      image: buttercupSvg
    }; // Buttercup
  };
  
  const style = getPowerpuffStyle();

  // Get product image based on product title
  const getProductImage = () => {
    const title = product.title.toLowerCase();
    
    if (title.includes("blazer")) {
      return "/images/products/linen-blazer.svg";
    }
    if (title.includes("dress")) {
      return "/images/products/linen-dress.svg";
    }
    if (title.includes("jeans")) {
      return "/images/products/slim-jeans.svg";
    }
    if (title.includes("trouser")) {
      return "/images/products/beige-trousers.svg";
    }
    if (title.includes("handbag") || title.includes("bag")) {
      return "/images/products/handbag.svg";
    }
    if (title.includes("shirt")) {
      return "/images/products/cotton-shirt.svg";
    }
    
    // Default fallbacks based on product category
    const category = product.subCategory?.toLowerCase() || "";
    
    if (category.includes("blazer")) return "/images/products/linen-blazer.svg";
    if (category.includes("dress") || category.includes("dresses")) return "/images/products/linen-dress.svg";
    if (category.includes("jeans")) return "/images/products/slim-jeans.svg";
    if (category.includes("trouser") || category.includes("pants")) return "/images/products/beige-trousers.svg";
    if (category.includes("bag") || category.includes("bags")) return "/images/products/handbag.svg";
    if (category.includes("shirt") || category.includes("shirts")) return "/images/products/cotton-shirt.svg";
    
    // Last resort fallback
    const id = product.id;
    if (id % 6 === 0) return "/images/products/linen-blazer.svg";
    if (id % 6 === 1) return "/images/products/linen-dress.svg";
    if (id % 6 === 2) return "/images/products/slim-jeans.svg";
    if (id % 6 === 3) return "/images/products/beige-trousers.svg";
    if (id % 6 === 4) return "/images/products/handbag.svg";
    return "/images/products/cotton-shirt.svg";
  };

  return (
    <Link href={`/product/${product.id}`} className="product-card group block">
        <div className="relative mb-4">
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white border-2 border-[#333] shadow-md">
            <div className="w-full h-full flex items-center justify-center p-2">
              <img 
                src={getProductImage()} 
                alt={product.title} 
                className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: style.bg}}>
              <span className="text-white text-xs font-bubblegum">{style.character}</span>
            </div>
          </div>
          <button 
            className="absolute top-3 right-3 bg-white border-2 border-[#333] rounded-full p-2 hover:bg-opacity-100 transition shadow-md"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
          >
            <Heart className={isInWishlist ? `h-4 w-4 fill-[${style.bg}] text-[${style.bg}]` : `h-4 w-4 text-[${style.bg}]`} />
          </button>
          
          {product.newArrival && (
            <div className={`absolute top-3 left-3 bg-[#7BDEFF] text-white text-xs px-2 py-1 rounded-full border-2 border-[#333] font-bubblegum shadow-md`}>New!</div>
          )}
          
          {product.onSale && (
            <div className={`absolute top-3 left-3 bg-[#FF9ED2] text-white text-xs px-2 py-1 rounded-full border-2 border-[#333] font-bubblegum shadow-md`}>
              {product.originalPrice ? `-${Math.round(100 - (product.price / product.originalPrice * 100))}%` : 'Sale!'}
            </div>
          )}
        </div>
        
        <h3 className="font-bubblegum text-lg leading-tight mb-1 text-[#333]">{product.title}</h3>
        <p className="text-sm mb-2 font-medium" style={{color: style.text}}>{product.subCategory}</p>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bubblegum text-lg" style={{color: style.text}}>${(product.price / 100).toFixed(2)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-[#666666] line-through text-sm">
                ${(product.originalPrice / 100).toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex text-xs">
            {Array.from({ length: 5 }).map((_, idx) => {
              const rating = product.rating || 0;
              if (idx < Math.floor(rating)) {
                return <Star key={idx} className="h-3 w-3" style={{fill: style.bg, color: style.bg}} />;
              } else if (idx === Math.floor(rating) && rating % 1 !== 0) {
                return <StarHalf key={idx} className="h-3 w-3" style={{fill: style.bg, color: style.bg}} />;
              } else {
                return <Star key={idx} className="h-3 w-3" style={{color: style.border}} />;
              }
            })}
          </div>
        </div>
    </Link>
  );
}