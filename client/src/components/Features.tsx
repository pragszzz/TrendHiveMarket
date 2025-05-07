import { Truck, CreditCard, RotateCcw, Headphones } from "lucide-react";

export default function Features() {
  return (
    <section className="bg-[#EBEDF0] py-12 mb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start">
            <div className="bg-white p-4 rounded-full">
              <Truck className="h-5 w-5 text-[#A0AEC0]" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium mb-2">Free Shipping</h3>
              <p className="text-[#666666] text-sm">On all orders over $100</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white p-4 rounded-full">
              <CreditCard className="h-5 w-5 text-[#A0AEC0]" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium mb-2">Secure Payment</h3>
              <p className="text-[#666666] text-sm">100% secure transactions</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white p-4 rounded-full">
              <RotateCcw className="h-5 w-5 text-[#A0AEC0]" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium mb-2">Easy Returns</h3>
              <p className="text-[#666666] text-sm">30-day return policy</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white p-4 rounded-full">
              <Headphones className="h-5 w-5 text-[#A0AEC0]" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium mb-2">Customer Support</h3>
              <p className="text-[#666666] text-sm">24/7 dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
