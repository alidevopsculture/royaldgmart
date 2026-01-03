'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/functional/ProductCard';
import { productData } from '@/types/product';

export default function SareePage() {
  const [products, setProducts] = useState<productData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=SAREE`);
        console.log(response);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log(data);
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <>
        
        <div className="flex justify-center items-center h-64 bg-gradient-to-r from-pink-100 to-purple-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      
      {/* Hero Banner */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center mb-8 overflow-hidden">
        <Image src="/banners/landscape-05.png" alt="Saree Banner" fill priority className="object-cover opacity-100" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-4" style={{ fontFamily: 'Quicksand, sans-serif' }}>Exquisite Sarees Collection</h1>
          <p className="text-lg md:text-xl text-white font-medium mb-6" style={{ fontFamily: 'Quicksand, sans-serif' }}>Traditional, Designer & Modern Styles for Every Occasion</p>
          {/* <a href="#featured" className="px-8 py-3 bg-pink-600 text-white rounded-full font-bold shadow-lg hover:bg-pink-700 transition">Shop Now</a> */}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 rounded-xl bg-white/80 shadow-lg">
        {/* Featured Saree Highlight */}
        {/* <section id="featured" className="mb-10 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl shadow">
          <Image src="/public/banners/DSC_2173_720x_dec1d27e-c2a7-4ce7-8b21-654c0ca12e43_1024x.png" alt="Featured Saree" width={320} height={320} className="rounded-xl object-cover shadow-lg" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-pink-800 mb-2">Featured: Banarasi Silk Saree</h2>
            <p className="text-gray-700 mb-4">Experience the luxury of pure silk and intricate golden zari work. Perfect for weddings and festive occasions.</p>
            <a href="#products" className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold shadow hover:bg-purple-700 transition">View All Sarees</a>
          </div>
        </section> */}

        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                Home
              </a>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Sarees</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Grid */}
        <section id="products">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No sarees found</p>
              </div>
            )}
          </div>
        </section>


      </div>
    </>
  );
}