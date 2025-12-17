import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ConditionalNavbar from "@/components/component/ConditionalNavbar";
import MobileToast from "@/components/functional/MobileToast";
import MobileBottomNav from "@/components/functional/MobileBottomNav";
import Footer from "@/components/functional/Footer";

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
      <body className={`${quicksand.className} pb-16 lg:pb-0`}>
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
