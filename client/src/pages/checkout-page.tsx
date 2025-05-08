import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Address, OrderItem, Product } from "@shared/schema.ts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  Loader2, 
  LockKeyhole, 
  CreditCardIcon,
  CheckCircle2 
} from "lucide-react";

// Form schema
const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // Fetch cart
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });
  
  // Fetch products for all items in cart
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!cart?.items?.length,
  });
  
  // Form setup
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (address: Address) => {
      if (!cart || !products) return null;
      
      // Create order items
      const orderItems: OrderItem[] = cart.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error("Product not found");
        
        return {
          ...item,
          price: product.price,
          title: product.title,
          image: product.images[0],
        };
      });
      
      // Calculate total amount
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      // Create order
      const res = await apiRequest("POST", "/api/orders", {
        items: orderItems,
        totalAmount,
        shippingAddress: address,
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        setOrderId(data.id);
        setOrderCompleted(true);
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });
  
  // Get product details for a cart item
  const getProductDetails = (productId: number) => {
    return products?.find(product => product.id === productId);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
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
  
  // Calculate shipping
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 10000 ? 0 : 599; // Free shipping over $100
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };
  
  // Handle form submission
  const onSubmit = (values: AddressFormValues) => {
    createOrderMutation.mutate(values);
  };
  
  // Loading state
  const isLoading = cartLoading || productsLoading;
  
  // Empty cart state
  const isEmpty = !isLoading && (!cart?.items || cart.items.length === 0);
  
  // If cart is empty, redirect to cart page
  if (isEmpty && !orderCompleted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-playfair text-3xl font-medium mb-4">Checkout</h1>
        <p className="text-[#666666] mb-8">Your cart is empty. Please add some products to continue.</p>
        <Button 
          onClick={() => navigate("/products")}
          className="bg-[#333333] hover:bg-black"
        >
          Shop Now
        </Button>
      </div>
    );
  }
  
  // If order is completed, show confirmation
  if (orderCompleted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#9DB5B2] bg-opacity-20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#9DB5B2]" />
          </div>
        </div>
        
        <h1 className="font-playfair text-3xl font-medium mb-4">Order Confirmed!</h1>
        <p className="text-[#666666] mb-8">
          Thank you for your purchase. Your order #{orderId} has been confirmed and will be shipped soon.
        </p>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="font-medium text-xl mb-4">Order Summary</h2>
            <Separator className="mb-4" />
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#666666]">Order number:</span>
                <span className="font-medium">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Order date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Payment method:</span>
                <span>{paymentMethod === "credit-card" ? "Credit Card" : "PayPal"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Total amount:</span>
                <span className="font-medium">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <p className="text-sm text-[#666666] mb-4">
              You will receive an email confirmation shortly at your registered email address.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate("/orders")}
              >
                View Orders
              </Button>
              <Button 
                className="bg-[#333333] hover:bg-black"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl font-medium mb-8">Checkout</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-40" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Separator />
                
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex gap-3">
                      <Skeleton className="w-16 h-16 rounded" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping and Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium text-xl mb-6">Shipping Address</h2>
                
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your street address" 
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your state" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your ZIP code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium text-xl mb-6">Payment Method</h2>
                
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className={`flex items-start border rounded-lg p-4 ${paymentMethod === "credit-card" ? "border-[#333333] bg-[#F7F8FA]" : "border-[#EBEDF0]"}`}>
                    <RadioGroupItem value="credit-card" id="credit-card" className="mt-1" />
                    <div className="ml-3 flex-1">
                      <label htmlFor="credit-card" className="font-medium flex items-center cursor-pointer">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Credit / Debit Card
                      </label>
                      
                      {paymentMethod === "credit-card" && (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="card-number" className="block text-sm font-medium mb-1">Card Number</label>
                              <div className="relative">
                                <Input 
                                  id="card-number" 
                                  placeholder="0000 0000 0000 0000" 
                                  className="pl-10" 
                                />
                                <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="card-name" className="block text-sm font-medium mb-1">Name on Card</label>
                              <Input id="card-name" placeholder="Enter name on card" />
                            </div>
                            <div>
                              <label htmlFor="expiry" className="block text-sm font-medium mb-1">Expiry Date</label>
                              <Input id="expiry" placeholder="MM / YY" />
                            </div>
                            <div>
                              <label htmlFor="cvv" className="block text-sm font-medium mb-1">CVV</label>
                              <div className="relative">
                                <Input id="cvv" placeholder="123" className="pl-10" />
                                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-[#666666]">
                            <LockKeyhole className="h-3 w-3 mr-1" />
                            Your payment information is secure and encrypted
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`flex items-start border rounded-lg p-4 ${paymentMethod === "paypal" ? "border-[#333333] bg-[#F7F8FA]" : "border-[#EBEDF0]"}`}>
                    <RadioGroupItem value="paypal" id="paypal" className="mt-1" />
                    <div className="ml-3">
                      <label htmlFor="paypal" className="font-medium flex items-center cursor-pointer">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.5 10.5H18C17.0717 10.5 16.6075 10.5 16.2159 10.3784C15.7554 10.2344 15.3656 9.94464 15.0992 9.55279C14.875 9.22304 14.7819 8.80132 14.5957 7.95787L14.4747 7.41033C14.0966 5.93091 13.9075 5.1912 13.5018 4.66859C13.159 4.22686 12.6936 3.88222 12.1618 3.67877C11.5439 3.45 10.7903 3.45 9.28296 3.45H4.5C4.0858 3.45 3.75 3.7858 3.75 4.2V13.8C3.75 14.2142 4.0858 14.55 4.5 14.55H7.5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.5 20.55H14.2169C15.7243 20.55 16.478 20.55 17.0959 20.3212C17.6277 20.1178 18.0931 19.7731 18.4359 19.3314C18.8416 18.8088 19.0307 18.0691 19.4088 16.5897L19.5298 16.0421C19.716 15.1987 19.8091 14.777 20.0333 14.4472C20.2997 14.0554 20.6895 13.7656 21.15 13.6216C21.5416 13.5 22.0057 13.5 22.934 13.5H20.25" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14.325 7.5L12.9 13.5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.675 7.5L8.25 13.5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.5 10.5H15" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        PayPal
                      </label>
                      
                      {paymentMethod === "paypal" && (
                        <div className="mt-4">
                          <p className="text-sm text-[#666666]">
                            You will be redirected to PayPal to complete your purchase securely.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            {/* Checkout button (mobile) */}
            <div className="lg:hidden">
              <Button 
                className="w-full bg-[#333333] hover:bg-black py-6 text-lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Complete Order - ${formatCurrency(calculateTotal())}`
                )}
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-medium text-xl mb-4">Order Summary</h2>
                  <Separator className="mb-4" />
                  
                  {/* Cart items */}
                  <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                    {cart?.items.map((item) => {
                      const product = getProductDetails(item.productId);
                      if (!product) return null;
                      
                      return (
                        <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                          <div className="w-16 h-16 bg-[#F7F8FA] rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={product.images[0]} 
                              alt={product.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{product.title}</h4>
                            <p className="text-xs text-[#666666]">
                              Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                            </p>
                            <p className="text-sm mt-1">
                              {formatCurrency(product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  {/* Totals */}
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
                    <Separator />
                    <div className="flex justify-between font-medium pt-2">
                      <span>Total</span>
                      <span className="text-lg">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                  
                  {/* Checkout button (desktop) */}
                  <div className="hidden lg:block">
                    <Button 
                      className="w-full bg-[#333333] hover:bg-black py-6 text-lg"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-[#666666] text-center mt-4">
                    By completing your purchase, you agree to our{" "}
                    <a href="#" className="underline">Terms of Service</a> and{" "}
                    <a href="#" className="underline">Privacy Policy</a>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
