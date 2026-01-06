import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ConditionalNavbar from "@/components/component/ConditionalNavbar";
import MobileToast from "@/components/functional/MobileToast";
import MobileBottomNav from "@/components/functional/MobileBottomNav";
import Footer from "@/components/functional/Footer";
import Script from "next/script";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Royal Retail Store",
  description: "Your premium online shopping destination",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${quicksand.className} pb-16 lg:pb-0`}>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              zIndex: 9999,
            },
          }}
        />
        <MobileToast />
        <ConditionalNavbar />
        {children}
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
