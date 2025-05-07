import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VirtualTryOnProps {
  productId: string;
  productTitle: string;
}

interface TryOnResponse {
  success: boolean;
  message: string;
  productId: number;
  imageUrl: string | null;
  tryOnId?: string;
  product?: {
    title: string;
    image: string;
    category: string;
  };
}

export default function VirtualTryOn({ productId, productTitle }: VirtualTryOnProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<TryOnResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleCameraToggle = async () => {
    if (cameraActive) {
      // Turn off camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraActive(false);
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setCameraActive(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Convert to data URL
      const dataURL = canvas.toDataURL("image/jpeg");
      setUploadedImage(dataURL);
    }
  };

  const processImage = async () => {
    if (!uploadedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload or capture an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Extract the base64 data from the Data URL
      const base64Data = uploadedImage.split(",")[1];

      const response = await apiRequest("POST", "/api/virtual-try-on", {
        productId,
        imageBase64: base64Data
      });

      const data: TryOnResponse = await response.json();

      if (data.success) {
        // Store the complete try-on result data
        setTryOnResult(data);
        
        // Set the result image from the response or use the original image as fallback
        if (data.imageUrl) {
          setResultImage(data.imageUrl);
        } else {
          setResultImage(uploadedImage);
        }
        
        toast({
          title: "Virtual Try-On Complete",
          description: "Your virtual try-on has been processed successfully.",
        });
      } else {
        throw new Error(data.message || "Failed to process image");
      }
    } catch (error: any) {
      toast({
        title: "Try-On Failed",
        description: error.message || "An error occurred during virtual try-on.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResultImage(null);
    setTryOnResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Virtual Try-On</CardTitle>
        <CardDescription>
          See how {productTitle} looks on you with our AR technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resultImage ? (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center bg-green-50 text-green-600 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Try-On Complete
              </div>
              <h3 className="text-lg font-medium">Here's how it looks on you!</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Try-on Result Image */}
              <div className="aspect-square overflow-hidden rounded-md border bg-gray-50">
                <img 
                  src={resultImage} 
                  alt="Virtual Try-On Result" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Product Details */}
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-medium">{tryOnResult?.product?.title || productTitle}</h4>
                  <p className="text-gray-500 mt-1 mb-4">
                    This item suits your style perfectly! You can adjust size and color before adding to cart.
                  </p>
                  
                  {/* Size Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {["XS", "S", "M", "L", "XL"].map((size) => (
                        <button 
                          key={size}
                          className="inline-flex items-center justify-center border border-gray-300 rounded-md px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="flex space-x-2">
                      {["#E5E7EB", "#4B5563", "#1F2937", "#F3F4F6", "#D1FAE5"].map((color) => (
                        <button 
                          key={color}
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button onClick={() => {}} className="w-full">
                    Add To Cart
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="w-full">
                    Try Another Photo
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-medium mb-2">Styling Tips</h4>
              <p className="text-gray-600 text-sm">
                This {tryOnResult?.product?.category || "item"} pairs well with neutral accessories and can be 
                dressed up with heels or down with casual sneakers for versatile styling options.
              </p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload Photo</TabsTrigger>
              <TabsTrigger value="camera">Use Camera</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <div className="aspect-square max-h-60 mx-auto overflow-hidden">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {cameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant={cameraActive ? "destructive" : "outline"} 
                  onClick={handleCameraToggle}
                >
                  {cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                </Button>
                
                {cameraActive && (
                  <Button onClick={capturePhoto}>
                    <Camera className="h-4 w-4 mr-2" /> Capture
                  </Button>
                )}
              </div>
            </TabsContent>

            {uploadedImage && (
              <div className="mt-4">
                <Button 
                  onClick={processImage} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Try It On
                    </>
                  )}
                </Button>
              </div>
            )}
          </Tabs>
        )}

        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>
            Your photos are processed securely and not stored permanently.
            By using this feature, you agree to our privacy policy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}