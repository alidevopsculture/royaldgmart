import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { JSX, SVGProps } from "react";
import ProductCard from "../functional/ProductCard";
import { getProducts } from "@/actions/product";
import { productDataGetting } from "@/types/product";
import LoadMoreProductsHome from "../functional/LoadMoreProductsHome";
import NotificationPopup from "../functional/NotificationPopup";

import NewsletterForm from "../functional/NewsletterForm";

export default async function Homepage({ user }: { user: any }) {
  let products: productDataGetting;
  
  try {
    products = await getProducts({
      limit: 10,
      page: 1,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    products = { 
      products: [], 
      currentPage: 1, 
      totalPages: 1, 
      totalProducts: 0, 
      hasNextPage: false, 
      hasPrevPage: false 
    };
  }

  // Ensure products is properly structured
  const safeProducts = products?.products || [];
  
  const transformedProducts = safeProducts
    .filter(product => product != null && (product as any).category !== 'WHOLESALE') // Filter out null products and wholesale products
    .map((product) => ({
      ...product,
      name: product.name || "Unnamed Product",
      images: Array.isArray(product.images) ? product.images : [],
    }));



  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-gradient-to-br from-amber-25 to-stone-50/80">
      <NotificationPopup />
      <main className="flex-1">
        {/* Hero Section - Modern Classic */}
        <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
          <Carousel 
            className="w-full h-full" 
            opts={{ loop: true }}
            autoScroll={true}
            autoScrollInterval={4000}
          >
            <CarouselContent>
              {[
                {
                  img: "/images/Hero01.png",
                  title: "Royal Collection",
                  subtitle: "Discover Elegance in Every Thread"
                },
                {
                  img: "/images/Hero03.png",
                  title: "Bridal Couture",
                  subtitle: "Your Dream Wedding Awaits"
                },
                {
                  img: "/images/Hero02.png",
                  title: "Festive Fashion",
                  subtitle: "Celebrate in Style"
                }
              ].map((slide, index) => (
                <CarouselItem key={index} className="relative">
                  <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh]">
                    <img
                      src={slide.img}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4 sm:px-6">
                      <div className="max-w-4xl space-y-6 sm:space-y-8">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight">
                          {slide.title}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl font-light opacity-95 max-w-2xl mx-auto">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 sm:left-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="right-4 sm:right-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" />
          </Carousel>
        </section>

        {/* New Arrivals - Classic Modern */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
                Be the first to know!
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 font-light italic-bold font-[cursive] max-w-2xl mx-auto">
                “about every new drop and special collection we release. Your favourites may arrive at any moment, so this space is always worth a second look.”
                
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {transformedProducts && transformedProducts.length > 0 ? (
                transformedProducts.slice(0, 4).map((product) => (
                  <div key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
  <div className="text-black-400 text-lg font-light italic-bold font-[cursive]">
    "Wear the culture, not trends — let every thread tell your story. Every design is chosen to reflect the elegance of tradition with the comfort you need every day.
    Each product is carefully checked for fabric, finishing and detailing before it reaches this section. That way you can shop with confidence, trusting the quality on your screen will match what arrives at your door."
  </div>
</div>

              )}
            </div>
            
            {/* Second row of products */}
            {transformedProducts && transformedProducts.length > 4 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
                {transformedProducts.slice(4, 8).map((product) => (
                  <div key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Categories Section - Refined */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
                Pick from Collections
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Curated collections for every occasion and style
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <CategoryCard
                img="/banners/banner01.png"
                title="Authentic Sarees"
                subtitle="Beautiful sarees for women"
                buttonText="Explore"
                href="/saree"
              />
              <CategoryCard
                img="/banners/banner02.png"
                title="Men's Collection"
                subtitle="Premium suiting & combos"
                buttonText="Explore"
                href="/men-suiting-shirting"
              />
              <CategoryCard
                img="/banners/banner03.png"
                title="Women's Unstitched"
                subtitle="Elegant unstitched suiting"
                buttonText="Explore"
                href="/women-unstiched-suits"
              />
              <CategoryCard
                img="/banners/banner04.png"
                title="Lehengas"
                subtitle="Beautiful lehengas for women"
                buttonText="Explore"
                href="/lehngas"
              />
            </div>
          </div>
        </section>

        {/* Featured Bridal Look - Elevated */}
        <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="/banners/landscape-04.png"
            alt="Featured Bridal Look"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="relative text-white px-6 sm:px-8 py-12 w-full max-w-4xl text-center lg:text-left lg:pl-16">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                Forever Bride
              </h1>
              <p className="text-xl sm:text-2xl font-light opacity-95 max-w-2xl">
                Your Fairytale Chapter Starts Here
              </p>
            </div>
          </div>
        </section>

       
        {/* Instagram Section - Refined */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.266.058 1.85.25 2.42.49a4.92 4.92 0 0 1 2.13 1.84c.58.82.77 1.4.83 2.42.06 1.266.07 1.646.07 4.85s-.01 3.584-.07 4.85c-.06 1.02-.25 1.6-.83 2.42a4.92 4.92 0 0 1-1.84 2.13c-.82.58-1.4.77-2.42.83-1.266.06-1.646.07-4.85.07s-3.584-.01-4.85-.07c-1.02-.06-1.6-.25-2.42-.83a4.92 4.92 0 0 1-2.13-1.84c-.58-.82-.77-1.4-.83-2.42-.06-1.266-.07-1.646-.07-4.85s.01-3.584.07-4.85c.06-1.02.25-1.6.83-2.42a4.92 4.92 0 0 1 1.84-2.13c.82-.58 1.4-.77 2.42-.83 1.266-.06 1.646-.07 4.85-.07M12 0C8.74 0 8.33.015 7.05.073 5.77.13 4.87.32 4.05.64c-.82.32-1.5.79-2.13 1.42C1.29 2.7 0.82 3.37.5 4.19.18 5 .015 5.9.015 7.18.015 8.46 0 8.87 0 12s.015 3.54.073 4.82c.058 1.28.25 2.18.57 3 .32.82.79 1.5 1.42 2.13.63.63 1.31 1.1 2.13 1.42.82.32 1.72.51 3 .57 1.28.058 1.69.073 4.95.073s3.67-.015 4.95-.073c1.28-.058 2.18-.25 3-.57.82-.32 1.5-.79 2.13-1.42.63-.63 1.1-1.31 1.42-2.13.32-.82.51-1.72.57-3 0-1.28.073-1.69.073-4.95s-.015-3.67-.073-4.95c-.058-1.28-.25-2.18-.57-3-.32-.82-.79-1.5-1.42-2.13-.63-.63-1.31-1.1-2.13-1.42-.82-.32-1.72-.51-3-.57C15.67.015 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.2a4.04 4.04 0 1 1 0-8.08 4.04 4.04 0 0 1 0 8.08zm6.41-10.8a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z" />
                  </svg>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900">
                  Follow Our Journey
                </h2>
              </div>
              <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Stay updated with our latest collections, style inspiration, and behind-the-scenes moments
              </p>
            </div>
            

            {/* Instagram Grid - Enhanced */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[
                {
                  img: "/images/ig01.png",
                  title: "Festive Saree Style",
                  desc: "Celebrating tradition with a modern twist.",
                  tag: "#FestiveFashion"
                },
                {
                  img: "/images/ig02.png",
                  title: "Bridal Elegance",
                  desc: "A moment to remember in our bridal collection.",
                  tag: "#BridalLook"
                },
                {
                  img: "/images/ig03.png",
                  title: "Summer Vibes",
                  desc: "Light, breezy, and beautiful for every day.",
                  tag: "#SummerStyle"
                },
                {
                  img: "/images/ig04.png",
                  title: "Classic Beauty",
                  desc: "Timeless saree looks for every occasion.",
                  tag: "#ClassicSaree"
                }
              ].map((post, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer aspect-square"
                >
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3 sm:p-6">
                    <div className="text-white space-y-1 sm:space-y-2">
                      <h3 className="font-light text-sm sm:text-lg tracking-wide">{post.title}</h3>
                      <p className="text-xs sm:text-sm font-light opacity-90 leading-relaxed">{post.desc}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 text-gray-800 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 font-medium text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                    {post.tag}
                  </div>
                </div>
              ))}
            </div>



            {/* Instagram CTA - Refined */}
            <div className="text-center mt-12 sm:mt-16">
              <a
                href="https://www.instagram.com/royal_digital_mart?igsh=Z280N2Q1eHY2cnY4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.266.058 1.85.25 2.42.49a4.92 4.92 0 0 1 2.13 1.84c.58.82.77 1.4.83 2.42.06 1.266.07 1.646.07 4.85s-.01 3.584-.07 4.85c-.06 1.02-.25 1.6-.83 2.42a4.92 4.92 0 0 1-1.84 2.13c-.82.58-1.4.77-2.42.83-1.266.06-1.646.07-4.85.07s-3.584-.01-4.85-.07c-1.02-.06-1.6-.25-2.42-.83a4.92 4.92 0 0 1-2.13-1.84c-.58-.82-.77-1.4-.83-2.42-.06-1.266-.07-1.646-.07-4.85s.01-3.584.07-4.85c.06-1.02.25-1.6.83-2.42a4.92 4.92 0 0 1 1.84-2.13c.82-.58 1.4-.77 2.42-.83 1.266-.06 1.646-.07 4.85-.07M12 0C8.74 0 8.33.015 7.05.073 5.77.13 4.87.32 4.05.64c-.82.32-1.5.79-2.13 1.42C1.29 2.7 0.82 3.37.5 4.19.18 5 .015 5.9.015 7.18.015 8.46 0 8.87 0 12s.015 3.54.073 4.82c.058 1.28.25 2.18.57 3 .32.82.79 1.5 1.42 2.13.63.63 1.31 1.1 2.13 1.42.82.32 1.72.51 3 .57 1.28.058 1.69.073 4.95.073s3.67-.015 4.95-.073c1.28-.058 2.18-.25 3-.57.82-.32 1.5-.79 2.13-1.42.63-.63 1.1-1.31 1.42-2.13.32-.82.51-1.72.57-3 0-1.28.073-1.69.073-4.95s-.015-3.67-.073-4.95c-.058-1.28-.25-2.18-.57-3-.32-.82-.79-1.5-1.42-2.13-.63-.63-1.31-1.1-2.13-1.42-.82-.32-1.72-.51-3-.57C15.67.015 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.2a4.04 4.04 0 1 1 0-8.08 4.04 4.04 0 0 1 0 8.08zm6.41-10.8a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z" />
                </svg>
                Follow @royalstore
              </a>
            </div>
          </div>
        </section>

         {/* Explore Featured Categories Carousel */}
        <section
          className="py-16 md:py-24 px-4 bg-[#FEFBEA]"
          aria-label="Explore Featured Categories Carousel"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                Explore Featured Categories
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-base md:text-lg">
                Discover our curated collections designed for every occasion
              </p>
            </div>
            
            {/* Mobile Carousel */}
            <div className="md:hidden">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {[
                    {
                      name: "Forever Bride",
                      img: "/banners/landscape-08.png",
                      subtitle: "Your Fairytale Chapter Starts Here",
                      buttonText: "Shop Now",
                    },
                    {
                      name: "Modern Muse",
                      img: "/banners/landscape-07.png",
                      subtitle: "Elegant Looks, Effortless Vibes",
                      buttonText: "Explore Now",
                    },
                    {
                      name: "Classic Edit",
                      img: "/banners/landscape-06.png",
                      subtitle: "Traditional Magic, Timeless Style",
                      buttonText: "See Collection",
                    },
                  ].map((cat) => (
                    <CarouselItem
                      key={cat.name}
                      className="pl-2 basis-4/5"
                    >
                      <div className="relative overflow-hidden rounded-xl shadow-lg h-[280px] w-full">
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-center pl-6">
                          <h2 className="text-white font-bold text-xl mb-2">
                            {cat.name}
                          </h2>
                          <p className="text-white text-sm mb-4 opacity-90">
                            {cat.subtitle}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
            
            {/* Desktop Carousel */}
            <div className="hidden md:block w-full">
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {[
                    {
                      name: "Forever Bride",
                      img: "/banners/landscape-08.png",
                      subtitle: "Your Fairytale Chapter Starts Here",
                    
                    },
                    {
                      name: "Modern Muse",
                      img: "/banners/landscape-07.png",
                      subtitle: "Elegant Looks, Effortless Vibes",
                    
                    },
                    {
                      name: "Classic Edit",
                      img: "/banners/landscape-06.png",
                      subtitle: "Traditional Magic, Timeless Style",
                      
                    },
                  ].map((cat) => (
                    <CarouselItem
                      key={cat.name}
                      className="pl-4 group"
                    >
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 h-[500px] w-full">
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-center pl-16 max-w-2xl">
                          <h2 className="text-white font-extrabold text-5xl mb-6 drop-shadow-2xl">
                            {cat.name}
                          </h2>
                          <p className="text-white text-2xl font-medium mb-8 drop-shadow-lg opacity-95">
                            {cat.subtitle}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
          </div>
        </section>


        {/* Shop The Sale Section - Elevated */}
        <section className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight leading-tight">
                Ready to Elevate Your Style?
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                Discover exceptional pieces for your festive and wedding wardrobe.
                Embrace elegance with our curated premium collection.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer - Modern Classic */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <HomeIcon className="h-8 w-8 text-white" />
                <span className="font-light text-2xl tracking-wide">RoyaldgMart</span>
              </div>
              <p className="text-gray-300 font-light leading-relaxed mb-8">
                Curating timeless elegance and contemporary style for the modern wardrobe.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/royal_digital_mart/?igsh=Z280N2Q1eHY2cnY4" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-light text-lg mb-6 text-white">Collections</h3>
              <ul className="space-y-3">
                <li><Link href="/saree" className="text-gray-300 hover:text-white transition-colors font-light">Sarees</Link></li>
                <li><Link href="/lehenga" className="text-gray-300 hover:text-white transition-colors font-light">Lehengas</Link></li>
                <li><Link href="/men" className="text-gray-300 hover:text-white transition-colors font-light">Men's Collection</Link></li>
                <li><Link href="/women" className="text-gray-300 hover:text-white transition-colors font-light">Women's Suits</Link></li>
                <li><Link href="/new" className="text-gray-300 hover:text-white transition-colors font-light">New Arrivals</Link></li>
              </ul>
            </div>

            {/* Legal & Policies */}
            <div>
              <h3 className="font-light text-lg mb-6 text-white">Legal & Policies</h3>
              <ul className="space-y-3">
                <li><Link href="/shipping" className="text-gray-300 hover:text-white transition-colors font-light">Shipping</Link></li>
                <li><Link href="/wholesale-shipping" className="text-gray-300 hover:text-white transition-colors font-light">W-Shipping</Link></li>
                <li><Link href="/return-policy" className="text-gray-300 hover:text-white transition-colors font-light">Return & Refund Policy</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors font-light">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="text-gray-300 hover:text-white transition-colors font-light">Disclaimer</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-light">Contact Us</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-light text-lg mb-6 text-white">Stay Connected</h3>
              <p className="text-gray-300 font-light mb-6 leading-relaxed">
                Subscribe for exclusive offers and style updates.
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 font-light text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300 font-light text-sm">SSL Protected</span>
                </div>
              </div>
              <p className="text-gray-400 font-light text-sm">
                © 2025 RoyalStore. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Category Card Component
function CategoryCard({
  img,
  title,
  subtitle,
  buttonText,
  href,
}: {
  img: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  href: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-[300px] sm:h-[400px] md:h-[450px] rounded-lg">
      <img
        src={img}
        alt={title}
        className="object-contain object-center w-full h-full transition-transform duration-700 group-hover:scale-105 bg-gray-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
        <div className="space-y-2 sm:space-y-3 md:space-y-4 text-white">
          <h3 className="text-lg sm:text-xl md:text-2xl font-light tracking-wide">{title}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base font-light opacity-90 leading-relaxed">{subtitle}</p>
          )}
          <Link
            href={href}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/95 text-black font-medium rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-105 backdrop-blur-sm text-xs sm:text-sm md:text-base"
            prefetch={false}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function HomeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="h-8 w-8 text-amber-500"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}