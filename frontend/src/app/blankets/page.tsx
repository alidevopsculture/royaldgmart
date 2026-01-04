'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/functional/ProductCard';
import { productData } from '@/types/product';

export default function Blankets() {
  const [products, setProducts] = useState<productData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=BLANKETS`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products || data || []);
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
      
      <section className="relative w-full h-[520px] md:h-[600px] flex items-center justify-center mb-8 overflow-hidden">
        <Image src="/banners/landscape-16.png" alt="Blankets Banner" fill priority className="object-cover opacity-100" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-4">Cozy Blankets Collection</h1>
          <p className="text-lg md:text-xl text-white font-medium mb-6">Warmth & Comfort for Every Season</p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8 rounded-xl bg-white/80 shadow-lg">
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">Home</a>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Blankets</span>
              </div>
            </li>
          </ol>
        </nav>
        <section id="products">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No blankets found</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </>
  );
}