"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type BookStatus = "To Read" | "Reading" | "Finished";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  created_at: string;
}

interface BooksContextType {
  books: Book[];
  loading: boolean;
  addBook: (input: {
    title: string;
    author: string;
    pages: number;
    status: BookStatus;
  }) => Promise<{ error?: string }>;
  advanceStatus: (id: string) => Promise<{ error?: string }>;
  deleteBook: (id: string) => Promise<{ error?: string }>;
  refreshBooks: () => Promise<void>;
}

const BooksContext = createContext<BooksContextType>({
  books: [],
  loading: false,
  addBook: async () => ({}),
  advanceStatus: async () => ({}),
  deleteBook: async () => ({}),
  refreshBooks: async () => {},
});

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchBooks = useCallback(async () => {
    if (!user) {
      setBooks([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching books:", error);
      } else {
        setBooks((data as Book[]) || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setBooks([]);
        }
      });
      return () => {
        isMounted = false;
      };
    }

    const loadBooks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false });

        if (isMounted && !error && data) {
          setBooks(data as Book[]);
        }
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, [user, supabase]);

  const addBook = async (input: {
    title: string;
    author: string;
    pages: number;
    status: BookStatus;
  }): Promise<{ error?: string }> => {
    if (!user) return { error: "User not logged in" };

    const payload = {
      user_id: user.id,
      title: input.title.trim(),
      author: input.author.trim(),
      pages: input.pages,
      status: input.status,
    };

    const { data, error } = await supabase
      .from("books")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    if (data) {
      setBooks((prev) => [data as Book, ...prev]);
    }
    return {};
  };

  const advanceStatus = async (id: string): Promise<{ error?: string }> => {
    const book = books.find((b) => b.id === id);
    if (!book) return { error: "Book not found" };

    let nextStatus: BookStatus | null = null;
    if (book.status === "To Read") nextStatus = "Reading";
    else if (book.status === "Reading") nextStatus = "Finished";

    if (!nextStatus) return {};

    const { error } = await supabase
      .from("books")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus! } : b))
    );
    return {};
  };

  const deleteBook = async (id: string): Promise<{ error?: string }> => {
    const { error } = await supabase.from("books").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    return {};
  };

  return (
    <BooksContext.Provider
      value={{
        books,
        loading,
        addBook,
        advanceStatus,
        deleteBook,
        refreshBooks: fetchBooks,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  return useContext(BooksContext);
}
