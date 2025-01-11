import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/app/NavBar/NavBar";
import { SessionProvider } from "@/lib/providers/SessionProvider";
import { validateRequest } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import localFont from 'next/font/local'

const satoshi = localFont({
  src: './satoshimd.otf',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "nextbooru",
  description: "A fast image sharing platform in next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await validateRequest()
  return (
    <html lang="en">
      <body className={satoshi.className}>
        <SessionProvider value={sessionData}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <Navbar />
          {children}
          <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
