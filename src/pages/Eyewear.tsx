import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ShoppingBag } from "lucide-react";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const Eyewear = () => {
  const [genderFilter, setGenderFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("featured");

  const products = [
    {
      id: 1,
      image: frame1,
      name: "Aurora Gold",
      price: 249,
      category: "Classic Round",
      gender: "unisex",
      style: "round"
    },
    {
      id: 2,
      image: frame2,
      name: "Metropolitan Black",
      price: 189,
      category: "Rectangular",
      gender: "male",
      style: "rectangular"
    },
    {
      id: 3,
      image: frame3,
      name: "Savanna Tortoise",
      price: 299,
      category: "Cat-Eye",
      gender: "female",
      style: "cat-eye"
    },
    {
      id: 4,
      image: frame4,
      name: "Sky Aviator",
      price: 329,
      category: "Aviator",
      gender: "unisex",
      style: "aviator"
    },
    {
      id: 5,
      image: frame1,
      name: "Rose Classic",
      price: 229,
      category: "Classic Round",
      gender: "female",
      style: "round"
    },
    {
      id: 6,
      image: frame2,
      name: "Executive Pro",
      price: 279,
      category: "Rectangular",
      gender: "male",
      style: "rectangular"
    },
    {
      id: 7,
      image: frame3,
      name: "Bella Vista",
      price: 319,
      category: "Cat-Eye",
      gender: "female",
      style: "cat-eye"
    },
    {
      id: 8,
      image: frame4,
      name: "Horizon Blue",
      price: 349,
      category: "Aviator",
      gender: "unisex",
      style: "aviator"
    }
  ];

  const filteredProducts = products
    .filter(p => genderFilter === "all" || p.gender === genderFilter || p.gender === "unisex")
    .filter(p => styleFilter === "all" || p.style === styleFilter)
    .sort((a, b) => {
      if (priceSort === "low-high") return a.price - b.price;
      if (priceSort === "high-low") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              M & H Eyewear Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designer frames that combine style, comfort, and precision
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card p-4 rounded-lg border">
            <div className="flex-1">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Men</SelectItem>
                  <SelectItem value="female">Women</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Frame Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="rectangular">Rectangular</SelectItem>
                  <SelectItem value="cat-eye">Cat-Eye</SelectItem>
                  <SelectItem value="aviator">Aviator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="low-high">Price: Low to High</SelectItem>
                  <SelectItem value="high-low">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-gold transition-all">
                <div className="relative h-64 overflow-hidden bg-secondary">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                    <Button size="icon" variant="secondary" className="shadow-lg">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="gold" className="shadow-lg">
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-accent font-medium">{product.category}</p>
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <p className="text-lg font-bold text-accent">₦{product.price.toLocaleString()}</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Details
                    </Button>
                    <Button variant="gold" size="sm" className="flex-1">
                      Try On
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Banner */}
          <Card className="mt-16 gradient-gold overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <Camera className="h-16 w-16 mx-auto text-accent-foreground" />
              <h2 className="text-3xl font-display font-bold text-accent-foreground">
                Try Before You Buy
              </h2>
              <p className="text-accent-foreground/90 max-w-2xl mx-auto">
                Upload your photo and see how any frame looks on your face with our AI-powered try-on technology
              </p>
              <Button variant="secondary" size="lg">
                Start Virtual Try-On
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Eyewear;
