import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans", // correspond exactement à ta variable CSS
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono", // correspond exactement à ta variable CSS
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HakoFlow",
  description: "HakoFlow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
