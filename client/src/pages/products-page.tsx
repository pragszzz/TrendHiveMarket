import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema.ts";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import Newsletter from "@/components/Newsletter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";

export default function ProductsPage() {
  const [, navigate] = useLocation();
  const { category: rawCategory } = useParams();
  const category = rawCategory ? rawCategory.toLowerCase() : undefined;
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search');
  
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<string>("featured");
  
  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [
      "/api/products", 
      category ? { category } : {}, 
      searchQuery ? { search: searchQuery } : {}
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) {
        params.append("category", category);
      }
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    }
  });
  
  // Debug logs
  console.log("products from API", products);
  
  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    // Filter by size
    if (selectedSizes.length > 0 && !product.sizes.some(size => selectedSizes.includes(size))) {
      return false;
    }
    
    // Filter by color
    if (selectedColors.length > 0 && !product.colors.some(color => selectedColors.includes(color.name))) {
      return false;
    }
    
    // Filter by price
    const productPrice = product.price / 100;
    if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
      return false;
    }
    
    return true;
  }) || [];
  
  console.log("filteredProducts", filteredProducts);
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "newest":
        return a.newArrival ? -1 : b.newArrival ? 1 : 0;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return b.featured ? 1 : a.featured ? -1 : 0;
    }
  });
  
  console.log("sortedProducts", sortedProducts);
  
  // Extract available sizes from products
  const sizeSet = new Set<string>();
  products?.forEach(product => product.sizes.forEach(size => sizeSet.add(size)));
  const availableSizes = Array.from(sizeSet).sort();
  
  // Extract available colors from products
  const colorSet = new Set<string>();
  products?.forEach(product => product.colors.forEach(color => colorSet.add(color.name)));
  const availableColors = Array.from(colorSet).sort();
  
  // Get all color codes for rendering
  const colorMap = products?.reduce((acc, product) => {
    product.colors.forEach(color => {
      acc[color.name] = color.code;
    });
    return acc;
  }, {} as Record<string, string>) || {};
  
  // Handle quick view
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };
  
  // Handle size selection
  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };
  
  // Handle color selection
  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 200]);
    setSortBy("featured");
  };
  
  // Set page title based on category or search
  useEffect(() => {
    let title = "Products";
    
    if (category) {
      title = `${category.charAt(0).toUpperCase() + category.slice(1)}`;
    } else if (searchQuery) {
      title = `Search: ${searchQuery}`;
    }
    
    document.title = `${title} | TrendHive`;
  }, [category, searchQuery]);

  return (
    <div className="bg-[#F7F8FA]">
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-medium mb-2">
            {category 
              ? category.charAt(0).toUpperCase() + category.slice(1) 
              : searchQuery 
                ? `Search: ${searchQuery}` 
                : "All Products"}
          </h1>
          <p className="text-[#666666]">
            {category 
              ? `Explore our curated collection of ${category} products.` 
              : searchQuery 
                ? `Showing results for "${searchQuery}"` 
                : "Browse our complete collection of products."}
          </p>
        </div>
        
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-6">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Filters sidebar - desktop */}
          <div className={`w-full md:w-64 md:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-lg">Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-[#A0AEC0] hover:text-[#333333]"
                >
                  Clear all
                </button>
              </div>
              
              <div className="divide-y divide-[#EBEDF0]">
                {/* Price Range */}
                <div className="py-4">
                  <h3 className="font-medium mb-4">Price Range</h3>
                  <Slider
                    defaultValue={[0, 200]}
                    min={0}
                    max={200}
                    step={5}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-[#666666]">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Size filter */}
                <Accordion type="single" collapsible defaultValue="sizes">
                  <AccordionItem value="sizes" className="border-0">
                    <AccordionTrigger className="py-4 font-medium">
                      Size
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSizes.map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`size-${size}`} 
                              checked={selectedSizes.includes(size)}
                              onCheckedChange={() => handleSizeToggle(size)}
                            />
                            <label 
                              htmlFor={`size-${size}`}
                              className="text-sm cursor-pointer"
                            >
                              {size}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Color filter */}
                <Accordion type="single" collapsible defaultValue="colors">
                  <AccordionItem value="colors" className="border-0">
                    <AccordionTrigger className="py-4 font-medium">
                      Color
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3">
                        {availableColors.map((color) => (
                          <div key={color} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`color-${color}`} 
                              checked={selectedColors.includes(color)}
                              onCheckedChange={() => handleColorToggle(color)}
                            />
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: colorMap[color] }}
                              />
                              <label 
                                htmlFor={`color-${color}`}
                                className="text-sm cursor-pointer"
                              >
                                {color}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              {/* Mobile close button */}
              <div className="md:hidden mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Products grid */}
          <div className="flex-1 md:pl-8">
            {/* Sort and results count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-[#666666]">
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  `${filteredProducts.length} products`
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2 hidden sm:inline">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                    <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {sortedProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="cursor-pointer">
                    <ProductCard product={product} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-[#666666] mb-6">
                  {selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 200 ? (
                    "Try adjusting your filters to see more products."
                  ) : (
                    "No products match your search criteria."
                  )}
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Newsletter />
      
      {/* Quick view modal */}
      <QuickViewModal 
        product={quickViewProduct} 
        open={isQuickViewOpen} 
        onOpenChange={setIsQuickViewOpen} 
      />
    </div>
  );
}
