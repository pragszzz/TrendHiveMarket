import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Product } from "@shared/schema.ts";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import Features from "@/components/Features";
import { Skeleton } from "@/components/ui/skeleton";

// Import SVG assets
import powerpuffSvg from "../assets/powerpuff.svg";
import ppgHeroSvg from "../assets/ppg-heroes.svg";
import ppgLogoSvg from "../assets/ppg-logo.svg";
import ppgCharactersSvg from "../assets/ppg-characters.svg";
import ppgOfficialPng from "../assets/ppg-official.png";
import blossomSvg from "../assets/blossom.svg";
import bubblesSvg from "../assets/bubbles.svg";
import buttercupSvg from "../assets/buttercup.svg";

export default function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: newProducts, isLoading: newLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/new"],
  });

  const { data: saleProducts, isLoading: saleLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/sale"],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#FFF9E6] py-16 md:py-24 border-b-4 border-b-[#FF9ED2]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-16 mb-8 md:mb-0">

              <h1 className="font-bubblegum text-4xl md:text-5xl lg:text-6xl font-bold text-[#FF9ED2] mb-6 ppg-shadow">
                Super Powered Style!
              </h1>
              <p className="text-[#333333] text-lg mb-8 max-w-lg font-medium">
                Sugar, spice, and everything nice - that's what your perfect wardrobe is made of! Shop our latest Powerpuff-inspired collection.
              </p>
              <div className="space-x-4">
                <Link href="/products/women" className="px-8 py-3 bg-[#FF9ED2] text-white rounded-full hover:bg-[#FF7BBF] transition font-bubblegum text-lg border-2 border-[#333] shadow-md">
                  Shop Women
                </Link>
                <Link href="/products/men" className="px-8 py-3 bg-[#7BDEFF] text-white rounded-full hover:bg-[#00C3FF] transition font-bubblegum text-lg border-2 border-[#333] shadow-md">
                  Shop Men
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative flex justify-center">
                <div className="rounded-lg shadow-lg border-4 border-[#333] p-1 bg-white flex items-center justify-center overflow-hidden" style={{width: "85%", maxWidth: "380px"}}>
                  <div className="relative flex items-center justify-center">
                    <img 
                      src={ppgOfficialPng} 
                      alt="The Powerpuff Girls"
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-[#83D475] p-2 rounded-lg shadow-md border-2 border-[#333]">
                      <p className="font-bubblegum text-base font-bold text-white">Super Collection</p>
                      <p className="text-white text-sm font-bold">Summer 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16 bg-[#FFF9E6]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bubblegum text-3xl font-bold text-[#FF9ED2] ppg-shadow">Featured Powers</h2>
          <Link href="/products" className="text-[#333] hover:text-[#FF9ED2] flex items-center font-bubblegum">
            View All <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg border-2 border-[#FF9ED2]" />
                  <Skeleton className="h-5 w-2/3 bg-[#FFCCE8]" />
                  <Skeleton className="h-4 w-1/2 bg-[#FFCCE8]" />
                  <Skeleton className="h-4 w-1/4 bg-[#FFCCE8]" />
                </div>
              ))
            : featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Categories Banner */}
      <section className="bg-[#FFC6E5] py-16 border-y-4 border-[#333]">
        <div className="container mx-auto px-4">
          <h2 className="font-bubblegum text-4xl font-bold text-center mb-12 text-[#333] ppg-shadow">Shop By Character</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group overflow-hidden rounded-lg ppg-border">
              <div className="bg-[#FFCCE8] w-full h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <img
                      src={blossomSvg}
                      alt="Blossom"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <h3 className="font-bubblegum text-xl text-[#FF7BBF]">Blossom Collection</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#FF9ED2] bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-40 transition duration-300">
                <Link href="/products/women" className="bg-[#FF9ED2] px-8 py-3 font-bubblegum text-white rounded-full hover:bg-[#FF7BBF] transition border-2 border-[#333] shadow-md">
                  Blossom
                </Link>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg ppg-border">
              <div className="bg-[#BBECFF] w-full h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <img
                      src={bubblesSvg}
                      alt="Bubbles"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <h3 className="font-bubblegum text-xl text-[#00C3FF]">Bubbles Collection</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#7BDEFF] bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-40 transition duration-300">
                <Link href="/products/men" className="bg-[#7BDEFF] px-8 py-3 font-bubblegum text-white rounded-full hover:bg-[#00C3FF] transition border-2 border-[#333] shadow-md">
                  Bubbles
                </Link>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg ppg-border">
              <div className="bg-[#C2F2BB] w-full h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <img
                      src={buttercupSvg}
                      alt="Buttercup"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <h3 className="font-bubblegum text-xl text-[#5BB04D]">Buttercup Collection</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#83D475] bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-40 transition duration-300">
                <Link href="/products/accessories" className="bg-[#83D475] px-8 py-3 font-bubblegum text-white rounded-full hover:bg-[#5BB04D] transition border-2 border-[#333] shadow-md">
                  Buttercup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-16 bg-[#E0F7FF]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bubblegum text-3xl font-bold text-[#7BDEFF] ppg-shadow">New Bubble Powers</h2>
          <Link href="/products/new" className="text-[#333] hover:text-[#7BDEFF] flex items-center font-bubblegum">
            View All <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {newLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg border-2 border-[#7BDEFF]" />
                  <Skeleton className="h-5 w-2/3 bg-[#BBECFF]" />
                  <Skeleton className="h-4 w-1/2 bg-[#BBECFF]" />
                  <Skeleton className="h-4 w-1/4 bg-[#BBECFF]" />
                </div>
              ))
            : newProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Sale Products */}
      <section className="container mx-auto px-4 py-16 bg-[#EAFFED]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bubblegum text-3xl font-bold text-[#83D475] ppg-shadow">Super Sale Powers</h2>
          <Link href="/products/sale" className="text-[#333] hover:text-[#83D475] flex items-center font-bubblegum">
            View All <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {saleLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg border-2 border-[#83D475]" />
                  <Skeleton className="h-5 w-2/3 bg-[#C2F2BB]" />
                  <Skeleton className="h-4 w-1/2 bg-[#C2F2BB]" />
                  <Skeleton className="h-4 w-1/4 bg-[#C2F2BB]" />
                </div>
              ))
            : saleProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
