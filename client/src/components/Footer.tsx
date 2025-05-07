import { Link } from "wouter";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-white border-t border-[#EBEDF0] pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-playfair text-xl font-medium mb-6">TrendHive</h3>
            <p className="text-[#666666] mb-6">
              Curated clothing collections that combine style, comfort, and sustainability for the modern individual.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#666666] hover:text-[#333333] transition" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#666666] hover:text-[#333333] transition" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#666666] hover:text-[#333333] transition" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#666666] hover:text-[#333333] transition" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-6">Shop</h4>
            <ul className="space-y-3 text-[#666666]">
              <li>
                <Link href="/products/new" className="hover:text-[#333333] transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products/women" className="hover:text-[#333333] transition">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products/men" className="hover:text-[#333333] transition">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products/accessories" className="hover:text-[#333333] transition">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products/sale" className="hover:text-[#333333] transition">
                  Sale
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-6">Help</h4>
            <ul className="space-y-3 text-[#666666]">
              <li>
                <a href="#" className="hover:text-[#333333] transition">Customer Service</a>
              </li>
              <li>
                <Link href={user ? "/orders" : "/auth"} className="hover:text-[#333333] transition">
                  My Account
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Find a Store</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Shipping Information</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Returns & Exchanges</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-6">About</h4>
            <ul className="space-y-3 text-[#666666]">
              <li>
                <a href="#" className="hover:text-[#333333] transition">Our Story</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Sustainability</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Press</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#333333] transition">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-[#EBEDF0]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#666666] text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} TrendHive. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-[#666666] text-sm hover:text-[#333333] transition">Privacy Policy</a>
              <a href="#" className="text-[#666666] text-sm hover:text-[#333333] transition">Terms of Service</a>
              <a href="#" className="text-[#666666] text-sm hover:text-[#333333] transition">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
