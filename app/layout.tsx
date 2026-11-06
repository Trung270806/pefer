import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BooksProvider } from "@/context/BooksContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ShelfLife - Track Your Books & Reading Journey",
  description: "A small web app where each person keeps a list of the books they want to read, are reading or have finished.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <BooksProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </BooksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
