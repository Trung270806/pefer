import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookPlus, BarChart3, Search, BookOpenCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 max-w-6xl mx-auto w-full text-center">
      <div className="space-y-4 max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <BookOpenCheck className="h-4 w-4" />
          <span>Your Personal Reading Companion</span>
        </div>
        <h1
          data-testid="home-title"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground"
        >
          ShelfLife
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Keep a list of the books you want to read, are currently reading, or have finished.
          Track your reading journey, monitor your total pages, and keep your bookshelf organized in one place.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link href="/books" className={buttonVariants({ size: "lg", className: "px-8" })}>
            Get Started
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "px-8" })}>
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
              <BookPlus className="h-6 w-6" />
            </div>
            <CardTitle>Add books</CardTitle>
            <CardDescription>
              Quickly record any book you encounter with title, author, total pages, and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add books to your shelf effortlessly and categorize them as To Read, Reading, or Finished.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
              <BarChart3 className="h-6 w-6" />
            </div>
            <CardTitle>Track your progress</CardTitle>
            <CardDescription>
              Advance statuses one step forward as you progress through each chapter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Watch your reading shelf statistics update in real-time, including total pages read.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
              <Search className="h-6 w-6" />
            </div>
            <CardTitle>Search your shelf</CardTitle>
            <CardDescription>
              Instant search and filter controls to quickly locate any book on your shelf.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Filter by status or search by author and title with immediate results and a clear breakdown.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
