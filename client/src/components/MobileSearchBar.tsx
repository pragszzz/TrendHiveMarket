import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

export default function MobileSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="md:hidden px-4 py-3 bg-white shadow-sm border-b-4 border-b-[#FF9ED2]">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FFF9E6] border-2 border-[#FF9ED2] focus:outline-none focus:ring-2 focus:ring-[#FF9ED2] text-sm font-inter"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9ED2]">
          <Search className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
