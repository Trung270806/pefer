# ShelfLife – FER202 Practical Exam (FALL 2026)

ShelfLife is a web app where each person keeps a list of the books they want to read, are reading or have finished, and tracks their shelf progress.

Built with **Next.js (App Router)**, **Tailwind CSS**, **ShadCN UI**, **React Context** for shared state, **Supabase** for database and authentication, and deployed on **Vercel**.

---

## 1. Tech Stack & Features

- **Next.js 16 (App Router)** with TypeScript
- **Tailwind CSS v4** & **ShadCN UI** (Button, Card, Input, Label, Badge, Separator)
- **Supabase Authentication**: Email/Password login and registration
- **Supabase PostgreSQL Database**: `books` table with Row Level Security (RLS) and constraints
- **Shared State**: React Context (`AuthContext` and `BooksContext`)
- **Responsive Design**: Mobile-friendly (375px+) and desktop optimized (1280px+)

---

## 2. Environment Variables

Create `.env.local` based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 3. Database Setup (Supabase)

Run the SQL script located in `supabase/books.sql` inside your Supabase **SQL Editor**:
- Creates `books` table with columns: `id`, `user_id`, `title`, `author`, `pages`, `status`, `created_at`.
- Strict check constraints:
  - `title`: required, max 80 characters.
  - `author`: required, max 60 characters.
  - `pages`: integer between 1 and 5000.
  - `status`: one of `'To Read'`, `'Reading'`, `'Finished'`.
- Row Level Security (RLS) enabled: users can only select, insert, update, and delete their own books.

---

## 4. Development & Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build

# Run linter
npm run lint
```

---

## 5. Automated Submission Scripts

Generate the official submission package with your Student Code:

```powershell
# 1. Generate Word document (e.g., QE200012.docx)
node scripts/create-doc.js <STUDENT_CODE> "<FULL_NAME>" "<VERCEL_URL>"

# 2. Package source code zip (e.g., QE200012.zip)
powershell -ExecutionPolicy Bypass -File scripts/make-zip.ps1 -Code <STUDENT_CODE>
```

Both files will be created inside the `submit/` folder, ready for exam submission.
