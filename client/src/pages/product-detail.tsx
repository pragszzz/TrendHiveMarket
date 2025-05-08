import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Review, CartItem, Wishlist } from "@shared/schema.ts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Minus, Search, Star, StarHalf, ShoppingBag, Truck, RotateCcw, Shirt, Camera } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Newsletter from "@/components/Newsletter";
import Features from "@/components/Features";
import VirtualTryOn from "@/components/VirtualTryOn";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = id || "";
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch product reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });
  
  // Fetch user's wishlist
  const { data: wishlist } = useQuery<Wishlist>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });
  
  // Check if product is in wishlist
  const isInWishlist = wishlist?.productIds?.includes(productId) || false;
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (cartItem: CartItem) => {
      const res = await apiRequest("POST", "/api/cart/add", {
        ...cartItem,
        productId: productId // Ensure productId is a string
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully",
      });
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
      const res = await apiRequest("POST", "/api/wishlist/toggle", {
        productId: productId // Ensure productId is a string
      });
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
  
  // Handler functions
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = () => {
    if (!user) {
      navigate("/auth");
      toast({
        title: "Please login",
        description: "You need to login to add items to your cart",
      });
      return;
    }
    
    if (!selectedSize && product?.sizes?.length) {
      toast({
        title: "Please select a size",
        description: "You need to select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedColor && product?.colors?.length) {
      toast({
        title: "Please select a color",
        description: "You need to select a color before adding to cart",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate({
      productId,
      quantity,
      size: selectedSize,
      color: selectedColor || product?.colors?.[0]?.name || "",
    });
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };
  
  const handleToggleWishlist = () => {
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
  
  // Render loading state
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="hidden md:block md:col-span-2 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-md" />
                ))}
              </div>
              <div className="md:col-span-10">
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
              </div>
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
            <Skeleton className="h-8 w-1/4" />
            <div className="flex space-x-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-12 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If product doesn't exist
  if (!product && !productLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-medium mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Images */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="hidden md:block md:col-span-2 space-y-4">
                {/* Thumbnail Images */}
                {product?.images?.map((image: string, index: number) => (
                  <div 
                    key={index}
                    className={`aspect-square border ${activeImage === index ? 'border-[#C6C9D2]' : 'border-[#EBEDF0]'} rounded-md overflow-hidden cursor-pointer hover:border-[#C6C9D2] transition`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image} alt={`${product.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="md:col-span-10 relative">
                {/* Main Image */}
                <div className="aspect-[4/5] bg-white rounded-lg overflow-hidden">
                  <img 
                    src={product?.images?.[activeImage]} 
                    alt={product?.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Zoom Icon */}
                <button className="absolute top-4 right-4 bg-white bg-opacity-70 rounded-full p-2.5 hover:bg-opacity-100 transition" aria-label="Zoom image">
                  <Search className="h-5 w-5 text-[#333333]" />
                </button>
                {/* Image Navigation (Mobile) */}
                <div className="flex justify-center space-x-2 mt-4 md:hidden">
                  {product?.images?.map((_: string, index: number) => (
                    <span 
                      key={index}
                      className={`h-2 w-2 rounded-full ${activeImage === index ? 'bg-[#C6C9D2]' : 'bg-[#EBEDF0]'}`}
                      onClick={() => setActiveImage(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              {/* Breadcrumbs */}
              <nav className="text-sm mb-6 hidden md:block">
                <ol className="flex space-x-2 text-[#666666]">
                  <li><a href="/" className="hover:text-[#333333]">Home</a></li>
                  <li><span className="mx-2">/</span></li>
                  <li><a href={`/products/${product?.category}`} className="hover:text-[#333333]">{product?.category}</a></li>
                  <li><span className="mx-2">/</span></li>
                  <li><a href={`/products/${product?.category}/${product?.subCategory}`} className="hover:text-[#333333]">{product?.subCategory}</a></li>
                </ol>
              </nav>

              {/* Product Info */}
              <h1 className="font-playfair text-3xl font-medium text-[#333333] mb-2">{product?.title}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const rating = product?.rating ?? 0;
                    if (idx < Math.floor(rating)) {
                      return <Star key={idx} className="h-4 w-4 fill-[#A0AEC0] text-[#A0AEC0]" />;
                    } else if (idx === Math.floor(rating) && rating % 1 !== 0) {
                      return <StarHalf key={idx} className="h-4 w-4 fill-[#A0AEC0] text-[#A0AEC0]" />;
                    } else {
                      return <Star key={idx} className="h-4 w-4 text-[#A0AEC0]" />;
                    }
                  })}
                </div>
                <span className="ml-2 text-[#666666] text-sm">{product?.rating ?? 0} ({product?.reviewCount ?? 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-2xl font-medium">${((product?.price ?? 0) / 100).toFixed(2)}</span>
                {product?.originalPrice && (
                  <span className="ml-3 text-[#666666] line-through text-lg">${((product?.originalPrice ?? 0) / 100).toFixed(2)}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-[#666666] mb-8">{product?.description}</p>

              {/* Size Selection */}
              {product?.sizes?.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Size</span>
                    <button className="text-sm text-[#A0AEC0] hover:underline">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size: string) => (
                      <div key={size} className="size-option">
                        <input 
                          type="radio" 
                          name="size" 
                          id={`size-${size}`} 
                          value={size} 
                          className="hidden" 
                          checked={selectedSize === size}
                          onChange={() => setSelectedSize(size)}
                        />
                        <label 
                          htmlFor={`size-${size}`} 
                          className={`flex justify-center py-2.5 border rounded-md cursor-pointer hover:border-[#C6C9D2] text-center block transition ${
                            selectedSize === size ? 'bg-[#E8E4DD] border-[#333333]' : 'border-[#EBEDF0]'
                          }`}
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product?.colors?.length > 0 && (
                <div className="mb-8">
                  <span className="font-medium block mb-3">Color</span>
                  <div className="flex space-x-3">
                    {product.colors.map((color: { name: string; code: string }) => (
                      <div key={color.name} className="color-option">
                        <input 
                          type="radio" 
                          name="color" 
                          id={`color-${color.name}`} 
                          value={color.name} 
                          className="hidden" 
                          checked={selectedColor === color.name}
                          onChange={() => setSelectedColor(color.name)}
                        />
                        <label 
                          htmlFor={`color-${color.name}`} 
                          className={`block w-8 h-8 rounded-full cursor-pointer`}
                          style={{ backgroundColor: color.code }}
                          title={color.name}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <span className="font-medium block mb-3">Quantity</span>
                <div className="flex h-12 w-32">
                  <button 
                    className="w-12 flex items-center justify-center border border-[#EBEDF0] border-r-0 rounded-l-md hover:bg-[#F7F8FA] transition" 
                    aria-label="Decrease quantity"
                    onClick={decreaseQuantity}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 border-y border-[#EBEDF0] text-center focus:outline-none focus:ring-1 focus:ring-[#C6C9D2]" 
                  />
                  <button 
                    className="w-12 flex items-center justify-center border border-[#EBEDF0] border-l-0 rounded-r-md hover:bg-[#F7F8FA] transition" 
                    aria-label="Increase quantity"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-4">
                <button 
                  className="w-full py-3.5 bg-[#333333] text-white rounded-md hover:bg-black transition flex items-center justify-center"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </button>
                <button 
                  className="w-full py-3.5 bg-white border border-[#333333] text-[#333333] rounded-md hover:bg-[#F7F8FA] transition flex items-center justify-center"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
                <button 
                  className="w-full py-3.5 bg-white border border-[#C6C9D2] text-[#333333] rounded-md hover:bg-[#F7F8FA] transition flex items-center justify-center"
                  onClick={handleToggleWishlist}
                  disabled={toggleWishlistMutation.isPending}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-[#333333]' : ''}`} />
                  {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-[#666666] mt-0.5" />
                  <div className="ml-3">
                    <span className="font-medium">Free Shipping</span>
                    <p className="text-[#666666] mt-0.5">On orders above $100</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <RotateCcw className="h-5 w-5 text-[#666666] mt-0.5" />
                  <div className="ml-3">
                    <span className="font-medium">Easy Returns</span>
                    <p className="text-[#666666] mt-0.5">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shirt className="h-5 w-5 text-[#666666] mt-0.5" />
                  <div className="ml-3">
                    <span className="font-medium">Material</span>
                    <p className="text-[#666666] mt-0.5">55% Linen, 45% Cotton</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Product Tabs */}
      <section className="container mx-auto px-4 mb-16">
        <Tabs defaultValue="description">
          <div className="border-b border-[#EBEDF0]">
            <TabsList className="flex overflow-x-auto space-x-8 h-auto bg-transparent p-0">
              <TabsTrigger 
                value="description" 
                className="py-4 font-medium data-[state=active]:text-[#333333] data-[state=active]:border-b-2 data-[state=active]:border-[#333333] whitespace-nowrap text-[#666666] hover:text-[#333333] rounded-none bg-transparent"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="py-4 font-medium data-[state=active]:text-[#333333] data-[state=active]:border-b-2 data-[state=active]:border-[#333333] whitespace-nowrap text-[#666666] hover:text-[#333333] rounded-none bg-transparent"
              >
                Reviews ({product?.reviewCount ?? 0})
              </TabsTrigger>
              <TabsTrigger 
                value="virtual-try-on" 
                className="py-4 font-medium data-[state=active]:text-[#333333] data-[state=active]:border-b-2 data-[state=active]:border-[#333333] whitespace-nowrap text-[#666666] hover:text-[#333333] rounded-none bg-transparent"
              >
                <span className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4" />
                  Virtual Try-On
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="size-fit" 
                className="py-4 font-medium data-[state=active]:text-[#333333] data-[state=active]:border-b-2 data-[state=active]:border-[#333333] whitespace-nowrap text-[#666666] hover:text-[#333333] rounded-none bg-transparent"
              >
                Size & Fit
              </TabsTrigger>
              <TabsTrigger 
                value="shipping" 
                className="py-4 font-medium data-[state=active]:text-[#333333] data-[state=active]:border-b-2 data-[state=active]:border-[#333333] whitespace-nowrap text-[#666666] hover:text-[#333333] rounded-none bg-transparent"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="description" className="py-8 max-w-3xl">
            <h3 className="font-medium text-lg mb-4">Product Details</h3>
            <div className="space-y-4 text-[#666666]">
              <p>{product?.description}</p>
              
              <h4 className="font-medium text-[#333333] mt-6 mb-2">Features:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Notched lapels</li>
                <li>Front button closure</li>
                <li>Flap pockets</li>
                <li>Breathable linen-cotton blend</li>
                <li>Partially lined</li>
                <li>Regular fit</li>
              </ul>
              
              <h4 className="font-medium text-[#333333] mt-6 mb-2">Care Instructions:</h4>
              <p>Dry clean only. Cool iron if needed. Do not bleach.</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-medium text-lg">Customer Reviews</h3>
              <Button 
                variant="outline" 
                onClick={() => user ? null : navigate("/auth")}
              >
                Write a Review
              </Button>
            </div>
            
            {reviewsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-[#EBEDF0]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{`User #${review.userId}`}</h4>
                      <span className="text-sm text-[#666666]">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="flex mb-3">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`h-4 w-4 ${idx < (review.rating ?? 0) ? 'fill-[#A0AEC0] text-[#A0AEC0]' : 'text-[#EBEDF0]'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-[#666666]">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-[#EBEDF0] rounded-md">
                <p className="text-[#666666] mb-4">No reviews yet for this product.</p>
                <Button 
                  variant="outline" 
                  onClick={() => user ? null : navigate("/auth")}
                >
                  Be the first to review
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="virtual-try-on" className="py-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="font-medium text-lg mb-6 text-center">Virtual Try-On Experience</h3>
              <p className="text-center text-[#666666] mb-8 max-w-xl mx-auto">
                See how this item will look on you using our virtual try-on technology. Upload a photo or use your camera to preview this piece with your existing wardrobe.
              </p>
              
              <VirtualTryOn productId={productId} productTitle={product?.title || ""} />
            </div>
          </TabsContent>

          <TabsContent value="size-fit" className="py-8 max-w-3xl">
            <h3 className="font-medium text-lg mb-4">Size & Fit Information</h3>
            <div className="space-y-4 text-[#666666]">
              <p>This blazer features a regular fit that's slightly relaxed through the body for comfort while maintaining a tailored appearance.</p>
              
              <div className="mt-6">
                <h4 className="font-medium text-[#333333] mb-4">Size Chart (in inches)</h4>
                <div className="relative overflow-x-auto border border-[#EBEDF0] rounded-md">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F7F8FA]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Size</th>
                        <th className="px-4 py-3 font-medium">Chest</th>
                        <th className="px-4 py-3 font-medium">Waist</th>
                        <th className="px-4 py-3 font-medium">Shoulder</th>
                        <th className="px-4 py-3 font-medium">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-[#EBEDF0]">
                        <td className="px-4 py-3">XS</td>
                        <td className="px-4 py-3">36-38</td>
                        <td className="px-4 py-3">28-30</td>
                        <td className="px-4 py-3">16.5</td>
                        <td className="px-4 py-3">27</td>
                      </tr>
                      <tr className="border-t border-[#EBEDF0]">
                        <td className="px-4 py-3">S</td>
                        <td className="px-4 py-3">38-40</td>
                        <td className="px-4 py-3">30-32</td>
                        <td className="px-4 py-3">17</td>
                        <td className="px-4 py-3">27.5</td>
                      </tr>
                      <tr className="border-t border-[#EBEDF0]">
                        <td className="px-4 py-3">M</td>
                        <td className="px-4 py-3">40-42</td>
                        <td className="px-4 py-3">32-34</td>
                        <td className="px-4 py-3">17.5</td>
                        <td className="px-4 py-3">28</td>
                      </tr>
                      <tr className="border-t border-[#EBEDF0]">
                        <td className="px-4 py-3">L</td>
                        <td className="px-4 py-3">42-44</td>
                        <td className="px-4 py-3">34-36</td>
                        <td className="px-4 py-3">18</td>
                        <td className="px-4 py-3">28.5</td>
                      </tr>
                      <tr className="border-t border-[#EBEDF0]">
                        <td className="px-4 py-3">XL</td>
                        <td className="px-4 py-3">44-46</td>
                        <td className="px-4 py-3">36-38</td>
                        <td className="px-4 py-3">18.5</td>
                        <td className="px-4 py-3">29</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <p className="mt-6">For the most accurate fit, we recommend measuring yourself and referring to the size chart above.</p>
              
              <h4 className="font-medium text-[#333333] mt-6 mb-2">How to Measure:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape level under your armpits.</li>
                <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                <li><strong>Shoulder:</strong> Measure from one shoulder edge to the other, across the back.</li>
                <li><strong>Length:</strong> Measure from the top of the shoulder to the desired length.</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="py-8 max-w-3xl">
            <h3 className="font-medium text-lg mb-4">Shipping & Returns</h3>
            <div className="space-y-6 text-[#666666]">
              <div>
                <h4 className="font-medium text-[#333333] mb-2">Shipping Policy</h4>
                <p>We offer the following shipping options:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li><strong>Standard Shipping (3-5 business days):</strong> $5.99, Free on orders over $100</li>
                  <li><strong>Express Shipping (1-2 business days):</strong> $12.99</li>
                  <li><strong>Next Day Delivery:</strong> $19.99 (order must be placed before 2pm)</li>
                </ul>
                <p className="mt-2">International shipping is available to select countries. Shipping times and fees vary by location.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-[#333333] mb-2">Return Policy</h4>
                <p>We accept returns within 30 days of the delivery date.</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Items must be unworn, unwashed, and with all original tags attached.</li>
                  <li>Return shipping is free for standard domestic returns.</li>
                  <li>Refunds will be issued to the original payment method within 5-7 business days after we receive your return.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-[#333333] mb-2">Exchange Process</h4>
                <p>If you need a different size or color, the simplest way is to return your item for a refund and place a new order. This ensures the fastest processing time.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-[#333333] mb-2">How to Initiate a Return</h4>
                <ol className="list-decimal pl-5 space-y-2 mt-2">
                  <li>Log into your account and go to your order history.</li>
                  <li>Select the order containing the item(s) you wish to return.</li>
                  <li>Follow the prompts to generate a return shipping label.</li>
                  <li>Pack the item(s) securely in the original packaging if possible.</li>
                  <li>Attach the shipping label and drop off at the specified carrier location.</li>
                </ol>
              </div>
              
              <p>If you have any questions about shipping or returns, please contact our customer service team.</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* You May Also Like Section */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <h2 className="font-playfair text-2xl font-medium mb-8">You May Also Like</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {/* Show loading skeletons or products based on product samples from storage */}
          {productLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))
          ) : (
            // Show similar products (from same category)
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="product-card group">
                <div className="relative mb-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white">
                    <img 
                      src={`https://images.unsplash.com/photo-${1548126032 + index * 1000}-079a0fb0099d?auto=format&fit=crop&w=500&h=650&q=80`}
                      alt="Related product" 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <button className="absolute top-3 right-3 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition" aria-label="Add to wishlist">
                    <Heart className="h-4 w-4 text-[#333333]" />
                  </button>
                </div>
                <h3 className="text-[#333333] font-medium leading-tight mb-1">Related Product {index + 1}</h3>
                <p className="text-[#666666] text-sm mb-2">Perfect style complement</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">${(79 + index * 10).toFixed(2)}</span>
                  <div className="flex text-xs text-[#A0AEC0]">
                    <Star className="h-3 w-3 fill-[#A0AEC0]" />
                    <Star className="h-3 w-3 fill-[#A0AEC0]" />
                    <Star className="h-3 w-3 fill-[#A0AEC0]" />
                    <Star className="h-3 w-3 fill-[#A0AEC0]" />
                    <Star className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Newsletter Section */}
      <Newsletter />
    </>
  );
}
