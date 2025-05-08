import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PackageOpen,
  ShoppingBag, 
  Truck, 
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processing":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
    case "shipped":
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Shipped</Badge>;
    case "delivered":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processing":
      return <PackageOpen className="h-5 w-5 text-blue-600" />;
    case "shipped":
      return <Truck className="h-5 w-5 text-orange-600" />;
    case "delivered":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    default:
      return <ShoppingBag className="h-5 w-5" />;
  }
};

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Toggle order expansion
  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };
  
  // Filter orders based on active tab
  const filteredOrders = orders?.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  }) || [];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <h1 className="font-playfair text-3xl font-medium mb-8">My Orders</h1>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-5 w-24 ml-auto" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <Skeleton className="w-16 h-16 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        Order #{order.id}
                        {getStatusBadge(order.status)}
                      </CardTitle>
                      <p className="text-[#666666] text-sm">
                        Placed on {formatDate(order.createdAt.toString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-sm text-[#666666]">{order.items.length} item(s)</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order status */}
                    <div className="flex items-center gap-2 p-3 bg-[#F7F8FA] rounded-md">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-medium">
                          {order.status === "processing" && "Order Processing"}
                          {order.status === "shipped" && "Order Shipped"}
                          {order.status === "delivered" && "Order Delivered"}
                        </p>
                        <p className="text-sm text-[#666666]">
                          {order.status === "processing" && "Your order is being processed"}
                          {order.status === "shipped" && "Your order is on the way"}
                          {order.status === "delivered" && "Your order has been delivered"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Preview of first item */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-[#F7F8FA] rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={order.items[0].image} 
                            alt={order.items[0].title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{order.items[0].title}</h4>
                          <p className="text-sm text-[#666666]">
                            Size: {order.items[0].size} | Color: {order.items[0].color} | Qty: {order.items[0].quantity}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {formatCurrency(order.items[0].price * order.items[0].quantity)}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View Details
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-6 space-y-6">
                        <div>
                          <h3 className="font-medium mb-3">All Items</h3>
                          <div className="space-y-4">
                            {order.items.slice(1).map((item, idx) => (
                              <div key={idx} className="flex gap-3">
                                <div className="w-16 h-16 bg-[#F7F8FA] rounded overflow-hidden flex-shrink-0">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium">{item.title}</h4>
                                  <p className="text-sm text-[#666666]">
                                    Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                  </p>
                                  <p className="text-sm font-medium mt-1">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-3">Shipping Address</h3>
                            <div className="bg-[#F7F8FA] p-4 rounded-md">
                              <p className="font-medium">{order.shippingAddress.fullName}</p>
                              <p>{order.shippingAddress.streetAddress}</p>
                              <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                              </p>
                              <p>{order.shippingAddress.country}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-3">Order Summary</h3>
                            <div className="bg-[#F7F8FA] p-4 rounded-md">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[#666666]">Subtotal</span>
                                  <span>
                                    {formatCurrency(order.totalAmount - (order.totalAmount >= 10000 ? 0 : 599))}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#666666]">Shipping</span>
                                  <span>
                                    {order.totalAmount >= 10000 
                                      ? "Free" 
                                      : formatCurrency(599)
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between font-medium pt-2 border-t border-[#EBEDF0]">
                                  <span>Total</span>
                                  <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate(`/product/${order.items[0].productId}`)}
                          >
                            Buy Again
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F8FA] rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-[#A0AEC0]" />
          </div>
          <h2 className="text-xl font-medium mb-2">No orders found</h2>
          <p className="text-[#666666] mb-6">
            {activeTab === "all" 
              ? "You haven't placed any orders yet." 
              : `You don't have any ${activeTab} orders.`
            }
          </p>
          <Button 
            onClick={() => navigate("/products")}
            className="bg-[#333333] hover:bg-black"
          >
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
}
