"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <BookOpen className="h-6 w-6" />
          <span>ShelfLife</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span data-testid="user-email" className="text-sm font-medium text-muted-foreground">
                {user.email}
              </span>
              <Link
                data-testid="link-books"
                href="/books"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Books
              </Link>
              <Button
                data-testid="btn-logout"
                variant="destructive"
                size="sm"
                onClick={signOut}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                data-testid="btn-login"
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Login
              </Link>
              <Link
                data-testid="btn-register"
                href="/register"
                className={buttonVariants({ size: "sm" })}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
