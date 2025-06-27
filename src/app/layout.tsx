import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CinemaStream - Your Ultimate Movie & TV Streaming Destination",
  description: "Stream the latest movies and TV shows with CinemaStream. Discover trending content, top-rated films, and binge-worthy series all in one place.",
  keywords: "movies, tv shows, streaming, cinema, entertainment, watch online",
  authors: [{ name: "CinemaStream Team" }],
  openGraph: {
    title: "CinemaStream - Stream Movies & TV Shows",
    description: "Your ultimate destination for streaming premium movies and TV shows",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CinemaStream - Stream Movies & TV Shows",
    description: "Your ultimate destination for streaming premium movies and TV shows",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
