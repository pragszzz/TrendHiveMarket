import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileSearchBar from "./MobileSearchBar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Fetch cart data
  const { data: cart } = useQuery<{items: Array<{quantity: number}>}>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });
  
  // Fetch wishlist data
  const { data: wishlist } = useQuery<{productIds: number[]}>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });
  
  // Count items in cart
  const cartCount = Array.isArray(cart?.items) 
    ? cart.items.reduce((sum: number, item: {quantity: number}) => sum + item.quantity, 0) 
    : 0;
  
  // Count items in wishlist
  const wishlistCount = Array.isArray(wishlist?.productIds) ? wishlist.productIds.length : 0;
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-b-[#FF9ED2]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              <Link href="/" className="font-bubblegum text-3xl font-bold tracking-wide text-[#FF9ED2] ppg-shadow">
                TrendHive
              </Link>
            </div>
            <span className="text-xs italic font-semibold text-[#666] -mt-1 ml-1">~by thePowerpuffGirls</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products/women" className="font-bubblegum text-lg text-[#FF9ED2] hover:text-[#FF4AA5] transition">
              Women
            </Link>
            <Link href="/products/men" className="font-bubblegum text-lg text-[#7BDEFF] hover:text-[#00C3FF] transition">
              Men
            </Link>
            <Link href="/products" className="font-bubblegum text-lg text-[#83D475] hover:text-[#4CAF50] transition">
              Collections
            </Link>
            <Link href="/products/sale" className="font-bubblegum text-lg text-[#FF9ED2] hover:text-[#FF4AA5] transition">
              Sale
            </Link>
            <Link href="/trends" className="font-bubblegum text-lg text-[#7BDEFF] hover:text-[#00C3FF] transition">
              Trend Analysis
            </Link>
            <Link href="/recommendations" className="font-bubblegum text-lg text-[#83D475] hover:text-[#4CAF50] transition">
              For You
            </Link>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-full bg-[#FFF9E6] border-2 border-[#FF9ED2] focus:outline-none focus:ring-2 focus:ring-[#FF9ED2] w-48 font-inter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    navigate(`/products?search=${encodeURIComponent(target.value)}`);
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9ED2] h-4 w-4" />
            </div>
            
            <Link href="/wishlist" className="relative hover:text-[#FF9ED2] transition" aria-label="Wishlist">
                <Heart className="h-5 w-5 text-[#FF9ED2]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-[#FF9ED2] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
            </Link>
            
            <Link href="/cart" className="relative hover:text-[#7BDEFF] transition" aria-label="Cart">
                <ShoppingBag className="h-5 w-5 text-[#7BDEFF]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-[#7BDEFF] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-[#83D475] transition md:ml-4" aria-label="Account">
                    <User className="h-5 w-5 text-[#83D475]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-2 border-[#83D475] font-bubblegum py-1">
                  <DropdownMenuItem className="cursor-default font-medium">
                    Hello, {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/orders")} className="text-[#FF9ED2] font-bubblegum">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")} className="text-[#7BDEFF] font-bubblegum">
                    My Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="text-[#83D475] font-bubblegum"
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth" className="hover:text-[#83D475] transition md:ml-4" aria-label="Login">
                <User className="h-5 w-5 text-[#83D475]" />
              </Link>
            )}
            
            <button 
              className="md:hidden hover:text-[#FF9ED2] transition" 
              aria-label="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 text-[#FF9ED2]" /> : <Menu className="h-5 w-5 text-[#FF9ED2]" />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden">
        <MobileSearchBar />
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#FFF9E6] z-40 pt-20 px-6 md:hidden overflow-y-auto border-t-4 border-t-[#FF9ED2]">
          <div className="flex flex-col space-y-5">
            <Link href="/products/women" className="font-bubblegum text-xl text-[#FF9ED2] py-2 border-b-2 border-[#FFCCE8]">
              Women
            </Link>
            <Link href="/products/men" className="font-bubblegum text-xl text-[#7BDEFF] py-2 border-b-2 border-[#BBECFF]">
              Men
            </Link>
            <Link href="/products" className="font-bubblegum text-xl text-[#83D475] py-2 border-b-2 border-[#C2F2BB]">
              Collections
            </Link>
            <Link href="/products/sale" className="font-bubblegum text-xl text-[#FF9ED2] py-2 border-b-2 border-[#FFCCE8]">
              Sale
            </Link>
            <Link href="/trends" className="font-bubblegum text-xl text-[#7BDEFF] py-2 border-b-2 border-[#BBECFF]">
              Trend Analysis
            </Link>
            <Link href="/recommendations" className="font-bubblegum text-xl text-[#83D475] py-2 border-b-2 border-[#C2F2BB]">
              For You
            </Link>
            
            <div className="pt-4">
              {user ? (
                <>
                  <p className="font-bubblegum text-xl mb-4 text-[#333]">Hello, {user.username}</p>
                  <Link href="/orders" className="block py-2 font-bubblegum text-lg text-[#FF9ED2]">
                    My Orders
                  </Link>
                  <Link href="/wishlist" className="block py-2 font-bubblegum text-lg text-[#7BDEFF]">
                    My Wishlist
                  </Link>
                  <button 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="block py-2 font-bubblegum text-lg text-[#83D475]"
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  className="w-full bg-[#FF9ED2] hover:bg-[#FF7BBF] text-white font-bubblegum text-lg"
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
