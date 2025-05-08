import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema.ts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch cart
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });
  
  // Fetch products for all items in cart
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!cart?.items?.length,
  });
  
  // Update cart mutation
  const updateCartMutation = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const res = await apiRequest("POST", "/api/cart", { items });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
    },
  });
  
  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });
  
  // Get product details for a cart item
  const getProductDetails = (productId: number) => {
    return products?.find(product => product.id === productId);
  };
  
  // Update item quantity
  const updateQuantity = (productId: number, size: string, color: string, newQuantity: number) => {
    if (!cart) return;
    
    let newItems: CartItem[];
    
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      newItems = cart.items.filter(
        item => !(item.productId === productId && item.size === size && item.color === color)
      );
    } else {
      // Update quantity for the specific item
      newItems = cart.items.map(item => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    }
    
    updateCartMutation.mutate(newItems);
  };
  
  // Remove item from cart
  const removeItem = (productId: number, size: string, color: string) => {
    if (!cart) return;
    
    const newItems = cart.items.filter(
      item => !(item.productId === productId && item.size === size && item.color === color)
    );
    
    updateCartMutation.mutate(newItems);
    
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!cart || !products) return 0;
    
    return cart.items.reduce((total, item) => {
      const product = getProductDetails(item.productId);
      if (product) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };
  
  // Calculate shipping
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 10000 ? 0 : 599; // Free shipping over $100
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };
  
  // Loading state
  const isLoading = cartLoading || productsLoading;
  
  // Empty cart state
  const isEmpty = !isLoading && (!cart?.items || cart.items.length === 0);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <h1 className="font-playfair text-3xl font-medium mb-8">Your Cart</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex flex-row sm:flex-col justify-between items-end space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-10 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F8FA] rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-[#A0AEC0]" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-[#666666] mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button 
            onClick={() => navigate("/products")}
            className="bg-[#333333] hover:bg-black"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="md:col-span-2 space-y-4">
            {cart?.items.map((item) => {
              const product = getProductDetails(item.productId);
              if (!product) return null;
              
              return (
                <Card key={`${item.productId}-${item.size}-${item.color}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product image */}
                      <div 
                        className="w-24 h-24 rounded-md flex-shrink-0 bg-[#F7F8FA] overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product details */}
                      <div className="flex-1">
                        <h3 
                          className="font-medium text-lg mb-1 cursor-pointer hover:text-[#A0AEC0]"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.title}
                        </h3>
                        <p className="text-[#666666] text-sm">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="font-medium mt-2">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      
                      {/* Quantity and actions */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between">
                        <div className="flex items-center h-10 border border-[#EBEDF0] rounded-md">
                          <button 
                            className="w-8 flex items-center justify-center hover:bg-[#F7F8FA]"
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            disabled={updateCartMutation.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center">{item.quantity}</span>
                          <button 
                            className="w-8 flex items-center justify-center hover:bg-[#F7F8FA]"
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            disabled={updateCartMutation.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <button 
                          className="text-[#666666] hover:text-[#333333] mt-2 flex items-center text-sm"
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          disabled={updateCartMutation.isPending}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Clear cart button */}
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                className="text-[#666666] hover:text-[#333333]"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
              
              <Button 
                variant="outline" 
                className="text-[#666666]"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending || isEmpty}
              >
                {clearCartMutation.isPending ? "Clearing..." : "Clear Cart"}
              </Button>
            </div>
          </div>
          
          {/* Order summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium text-xl mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Subtotal</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Shipping</span>
                    <span>
                      {calculateShipping() === 0 
                        ? "Free" 
                        : formatCurrency(calculateShipping())
                      }
                    </span>
                  </div>
                  <div className="border-t border-[#EBEDF0] pt-3 flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-lg">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-[#333333] hover:bg-black"
                  onClick={() => navigate("/checkout")}
                  disabled={isEmpty}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="mt-4 text-xs text-[#666666]">
                  <p>Shipping calculated at checkout</p>
                  <p className="mt-1">Taxes calculated at checkout</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
