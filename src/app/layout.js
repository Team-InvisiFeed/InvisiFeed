import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import ClientWrapper from "./ClientWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InvisiFeed",
  description:
    "Empowering businesses with authentic, anonymous feedback through secure QR-based invoicing.",
   verification: {
    google: 'zv5irB-R4RF0BMewa4wyOX7BpNnRglGG4x8IP3JHJP8',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientWrapper>{children}</ClientWrapper>
          <Toaster duration={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}
