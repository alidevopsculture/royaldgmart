/**
* Royal Retail Store - About Us Page
* Modern, attractive design with black, grey, and light white theme
*/

import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { JSX, SVGProps } from "react"

export function About() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container relative px-4 md:px-6 mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              About <span className="text-gray-300">Royal Retail</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              We're not just another e-commerce platform. We're your trusted partner in discovering 
              exceptional products that elevate your lifestyle and exceed your expectations.
            </p>
            <div className="flex justify-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">10M+</div>
                <div className="text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">50K+</div>
                <div className="text-gray-400">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">150+</div>
                <div className="text-gray-400">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Our Mission
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  To revolutionize online shopping by providing a seamless, secure, and personalized 
                  experience that connects customers with premium products from around the world.
                </p>
              </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">Our Vision</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become the world's most customer-centric e-commerce platform, where every 
                  interaction creates value and every purchase brings joy.
                </p>
              </div>
            </div>
            <div className="relative flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl object-cover w-full max-w-lg h-[500px]"
              />
            </div>
          </div>
          </div>
        </section>

      {/* Values Section */}
      <section className="w-full py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape the way we serve our customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer First</h3>
              <p className="text-gray-600">
                Every decision we make starts with our customers' needs and satisfaction.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality & Trust</h3>
              <p className="text-gray-600">
                We maintain the highest standards of quality and build lasting trust with our community.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <LightbulbIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We constantly push boundaries to create better shopping experiences through technology.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <GlobeIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Impact</h3>
              <p className="text-gray-600">
                We connect people worldwide and support sustainable business practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full py-20 bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Our story"
                className="rounded-2xl shadow-2xl object-cover w-full max-w-lg h-[600px]"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-300">
                <p className="text-lg leading-relaxed">
                  Founded in 2018, Royal Retail began as a small startup with a big dream: to transform 
                  the way people shop online. What started in a garage with just three passionate 
                  entrepreneurs has grown into a global e-commerce powerhouse.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we serve millions of customers across 150+ countries, offering everything from 
                  cutting-edge electronics to timeless fashion pieces. Our journey has been marked by 
                  innovation, resilience, and an unwavering commitment to our customers.
                </p>
                <p className="text-lg leading-relaxed">
                  We believe that great shopping experiences shouldn't be limited by geography or 
                  circumstance. That's why we've built a platform that brings the world's best products 
                  to your doorstep, no matter where you are.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>

      {/* Team Section */}
      <section className="w-full py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Leadership
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The brilliant minds behind Royal Retail's success story
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                  alt="CEO"
                  className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alexander Chen</h3>
              <p className="text-gray-600 mb-3">CEO & Founder</p>
              <p className="text-sm text-gray-500">
                Former tech executive with 15+ years of e-commerce experience
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                  alt="CTO"
                  className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Rodriguez</h3>
              <p className="text-gray-600 mb-3">CTO</p>
              <p className="text-sm text-gray-500">
                Tech visionary leading our AI and machine learning initiatives
              </p>
                </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="CMO"
                  className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Michael Thompson</h3>
              <p className="text-gray-600 mb-3">CMO</p>
              <p className="text-sm text-gray-500">
                Marketing expert who built brands worth billions
              </p>
                </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="COO"
                  className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emily Watson</h3>
              <p className="text-gray-600 mb-3">COO</p>
              <p className="text-sm text-gray-500">
                Operations specialist ensuring seamless customer experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-20 bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              By The Numbers
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our impact in numbers that tell the story of our growth and success
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">$2.5B+</div>
              <div className="text-gray-400">Annual Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
                <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
                </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Ready to Experience Royal Retail?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join millions of satisfied customers who trust us for their shopping needs. 
              Start your journey with Royal Retail today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300"
              >
                Shop Now
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                Contact Us
              </Link>
              </div>
            </div>
          </div>
        </section>
    </div>
  )
}

// Icon Components
function HeartIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ShieldIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function LightbulbIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
      <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
    </svg>
  )
}

function GlobeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
