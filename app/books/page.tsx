"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBooks, BookStatus } from "@/context/BooksContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookPlus, Trash2, ChevronRight, Search, X, BookOpen, Layers } from "lucide-react";

export default function BooksPage() {
  const { user, loading: authLoading } = useAuth();
  const { books, addBook, advanceStatus, deleteBook } = useBooks();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState("");

  // Error & Success State
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorAuthor, setErrorAuthor] = useState<string | null>(null);
  const [errorPages, setErrorPages] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorBook, setErrorBook] = useState<string | null>(null);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search State
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Validation functions
  const validateTitle = (val: string): string | null => {
    if (!val || val.trim() === "") {
      return "Title is required";
    }
    if (val.length > 80) {
      return "Title must be at most 80 characters";
    }
    return null;
  };

  const validateAuthor = (val: string): string | null => {
    if (!val || val.trim() === "") {
      return "Author is required";
    }
    if (val.length > 60) {
      return "Author must be at most 60 characters";
    }
    return null;
  };

  const validatePages = (val: string): string | null => {
    if (!val || val.trim() === "") {
      return "Pages is required";
    }
    const trimmed = val.trim();
    if (!/^\d+$/.test(trimmed)) {
      return "Pages must be a whole number between 1 and 5000";
    }
    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1 || num > 5000) {
      return "Pages must be a whole number between 1 and 5000";
    }
    return null;
  };

  const validateStatus = (val: string): string | null => {
    if (!val || val === "") {
      return "Please choose a status";
    }
    return null;
  };

  // Change handlers to clear errors when field becomes valid
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (hasSubmitted) {
      setErrorTitle(validateTitle(val));
    }
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthor(val);
    if (hasSubmitted) {
      setErrorAuthor(validateAuthor(val));
    }
  };

  const handlePagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPages(val);
    if (hasSubmitted) {
      setErrorPages(validatePages(val));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    if (hasSubmitted) {
      setErrorStatus(validateStatus(val));
    }
  };

  // Form Submit Handler
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorBook(null);
    setBookSuccess(null);

    const titleErr = validateTitle(title);
    const authorErr = validateAuthor(author);
    const pagesErr = validatePages(pages);
    const statusErr = validateStatus(status);

    setErrorTitle(titleErr);
    setErrorAuthor(authorErr);
    setErrorPages(pagesErr);
    setErrorStatus(statusErr);

    if (titleErr || authorErr || pagesErr || statusErr) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await addBook({
        title: title.trim(),
        author: author.trim(),
        pages: parseInt(pages.trim(), 10),
        status: status as BookStatus,
      });

      if (res.error) {
        setErrorBook(res.error);
      } else {
        setBookSuccess("Book added");
        // Clear form
        setTitle("");
        setAuthor("");
        setPages("");
        setStatus("");
        setHasSubmitted(false);
      }
    } catch (err: unknown) {
      setErrorBook(err instanceof Error ? err.message : "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search Logic
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Status filter
      if (filterStatus && book.status !== filterStatus) {
        return false;
      }
      // Search filter (title or author, not case-sensitive, spaces at both ends ignored)
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author.toLowerCase().includes(query);
        if (!titleMatch && !authorMatch) {
          return false;
        }
      }
      return true;
    });
  }, [books, filterStatus, searchQuery]);

  // Summary Calculations
  const totalPages = useMemo(() => {
    return filteredBooks.reduce((sum, b) => sum + (Number(b.pages) || 0), 0);
  }, [filteredBooks]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of filteredBooks) {
      counts[b.status] = (counts[b.status] || 0) + 1;
    }

    const tieOrder: Record<string, number> = {
      "To Read": 1,
      Reading: 2,
      Finished: 3,
    };

    return Object.entries(counts)
      .map(([statusName, count]) => ({ status: statusName, count }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return (tieOrder[a.status] || 99) - (tieOrder[b.status] || 99);
      });
  }, [filteredBooks]);

  const handleClearFilters = () => {
    setFilterStatus("");
    setSearchQuery("");
  };

  // Do not render anything while checking auth to prevent content flash or wrong redirect
  if (authLoading || !user) {
    return null;
  }

  const getStatusBadgeVariant = (st: BookStatus) => {
    switch (st) {
      case "To Read":
        return "secondary";
      case "Reading":
        return "default";
      case "Finished":
        return "outline";
    }
  };

  return (
    <div data-testid="books-page" className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Reading Shelf</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal reading collection and track your reading journey.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column at 1280px+: Add Book Form & Shelf Summary */}
        <div className="xl:col-span-4 space-y-6">
          {/* Add Book Form Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookPlus className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Add a Book</CardTitle>
              </div>
              <CardDescription>Enter details to add a new book to your shelf</CardDescription>
            </CardHeader>
            <CardContent>
              <form data-testid="book-form" noValidate onSubmit={handleAddBook} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-title">Title</Label>
                  <Input
                    id="input-title"
                    data-testid="input-title"
                    placeholder="e.g. The Great Gatsby"
                    value={title}
                    onChange={handleTitleChange}
                    disabled={submitting}
                  />
                  {errorTitle && (
                    <p data-testid="error-title" className="text-sm font-medium text-destructive">
                      {errorTitle}
                    </p>
                  )}
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-author">Author</Label>
                  <Input
                    id="input-author"
                    data-testid="input-author"
                    placeholder="e.g. F. Scott Fitzgerald"
                    value={author}
                    onChange={handleAuthorChange}
                    disabled={submitting}
                  />
                  {errorAuthor && (
                    <p data-testid="error-author" className="text-sm font-medium text-destructive">
                      {errorAuthor}
                    </p>
                  )}
                </div>

                {/* Pages */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-pages">Pages</Label>
                  <Input
                    id="input-pages"
                    data-testid="input-pages"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 180"
                    value={pages}
                    onChange={handlePagesChange}
                    disabled={submitting}
                  />
                  {errorPages && (
                    <p data-testid="error-pages" className="text-sm font-medium text-destructive">
                      {errorPages}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="select-status">Status</Label>
                  <select
                    id="select-status"
                    data-testid="select-status"
                    value={status}
                    onChange={handleStatusChange}
                    disabled={submitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose status</option>
                    <option value="To Read">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                  {errorStatus && (
                    <p data-testid="error-status" className="text-sm font-medium text-destructive">
                      {errorStatus}
                    </p>
                  )}
                </div>

                {/* Feedback Messages */}
                {errorBook && (
                  <div
                    data-testid="error-book"
                    className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium"
                  >
                    {errorBook}
                  </div>
                )}

                {bookSuccess && (
                  <div
                    data-testid="book-success"
                    className="p-3 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
                  >
                    {bookSuccess}
                  </div>
                )}

                <Button data-testid="btn-add-book" type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Book"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Shelf Summary</CardTitle>
              </div>
              <CardDescription>Overview of currently displayed books</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Books
                  </p>
                  <p data-testid="book-count" className="text-2xl font-bold mt-1 text-foreground">
                    {filteredBooks.length}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Pages
                  </p>
                  <p data-testid="total-pages" className="text-2xl font-bold mt-1 text-foreground">
                    {totalPages}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Status Breakdown
                </p>
                <div data-testid="status-breakdown" className="space-y-2">
                  {statusBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No books in current view</p>
                  ) : (
                    statusBreakdown.map((item) => (
                      <div
                        key={item.status}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between text-sm py-1.5 px-3 rounded-md bg-muted/40"
                      >
                        <span data-testid="breakdown-name" className="font-medium text-foreground">
                          {item.status}
                        </span>
                        <span data-testid="breakdown-count" className="font-bold text-primary">
                          {item.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Search/Filters & Books List */}
        <div className="xl:col-span-8 space-y-6">
          {/* Controls: Filter & Search Bar */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-testid="search-input"
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <select
                    data-testid="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All</option>
                    <option value="To Read">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>

                <Button
                  data-testid="btn-clear-filters"
                  variant="outline"
                  onClick={handleClearFilters}
                  className="shrink-0"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Book List / Empty State */}
          {filteredBooks.length === 0 ? (
            <Card className="border-dashed p-12 text-center shadow-none">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-muted rounded-full text-muted-foreground">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 data-testid="books-empty" className="text-lg font-semibold text-foreground">
                  No books found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {books.length === 0
                    ? "Your shelf is currently empty. Add your first book using the form."
                    : "No books match your current search and status filter criteria."}
                </p>
              </div>
            </Card>
          ) : (
            <div data-testid="book-list" className="space-y-4">
              {filteredBooks.map((book) => (
                <Card
                  key={book.id}
                  data-testid="book-item"
                  className="shadow-sm hover:shadow transition-shadow overflow-hidden"
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          data-testid="book-title"
                          className="font-semibold text-lg text-foreground truncate"
                        >
                          {book.title}
                        </h3>
                        <Badge
                          data-testid="book-status"
                          variant={getStatusBadgeVariant(book.status)}
                          className="font-medium"
                        >
                          {book.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by{" "}
                        <span data-testid="book-author" className="font-medium text-foreground">
                          {book.author}
                        </span>
                      </p>
                      <p data-testid="book-pages" className="text-xs text-muted-foreground font-mono">
                        {book.pages} pages
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Advance Button: ONLY rendered if not Finished */}
                      {book.status !== "Finished" && (
                        <Button
                          data-testid="btn-advance-status"
                          size="sm"
                          variant="outline"
                          onClick={() => advanceStatus(book.id)}
                          className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <span>Advance</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Delete Button */}
                      <Button
                        data-testid="btn-delete-book"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBook(book.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1.5">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

