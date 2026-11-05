# FER202 – Môi trường làm bài Practical Exam

Môi trường đã được dựng sẵn để làm các đề dạng **SpendWise** (Next.js + Tailwind + ShadCN + Supabase + Vercel).
Ảnh chụp đề gốc nằm trong `de-bai/` (thư mục này bị `.gitignore`, không bị đẩy lên GitHub).

---

## 1. Đã cài sẵn những gì

| Thành phần | Phiên bản / ghi chú |
|---|---|
| Next.js (App Router, TypeScript) | 16.x – thư mục `app/` |
| React | 19.x |
| Tailwind CSS v4 | qua `postcss.config.mjs` + `@tailwindcss/postcss` |
| ShadCN UI | `components.json` ở gốc; component trong `components/ui/` |
| ShadCN components | button, card, input, label, select, native-select, textarea, badge, separator, sonner, table |
| Supabase | `@supabase/supabase-js`, `@supabase/ssr`; client mẫu ở `lib/supabase/client.ts` |
| Font | `geist` (font cục bộ – build được khi offline) |
| Vercel CLI | cài global (`vercel --version`) |
| Script nén bài nộp | `scripts/make-zip.ps1` |

> ⚠️ Máy đang dùng **Node 26**: Turbopack bị lỗi *"node process exited before we could connect"*,
> nên `dev`/`build` đã được đặt chạy bằng **webpack** (`next dev --webpack`, `next build --webpack`).
> Nếu muốn dùng Turbopack, hãy cài Node 22/24 LTS.

Thêm component ShadCN khác: `npx shadcn@latest add <tên>` (vd. `dialog`, `checkbox`, `form`).

---

## 2. Các bước khi bắt đầu một đề mới

1. Tạo project Supabase → **Project Settings → API** lấy `Project URL` và `anon public key`.
2. Copy `.env.example` → `.env.local` và điền 2 biến:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Không bao giờ viết key trực tiếp trong code, không dùng `service_role`.
3. Supabase → **Authentication → Providers → Email** → tắt **Confirm email**.
4. Viết SQL tạo bảng + constraint + RLS trong SQL Editor, rồi lưu lại vào `supabase/<tên>.sql`.
5. Tạo tài khoản test cho người chấm (đăng ký qua chính app hoặc Supabase Auth → Add user).
6. `npm run dev` → mở http://localhost:3000.

## 3. Deploy & nộp bài

1. `git init` → push lên repo GitHub **public**.
2. Vercel → Import repo → thêm 2 biến `NEXT_PUBLIC_SUPABASE_*` → Deploy
   (hoặc dùng CLI: `vercel`, `vercel env add`, `vercel --prod`).
3. Tắt **Vercel Authentication** (Settings → Deployment Protection). Dùng link **production** `https://<project>.vercel.app`.
4. Đăng nhập thử bằng tài khoản test trên site đã deploy.
5. Tạo zip: `powershell -ExecutionPolicy Bypass -File scripts/make-zip.ps1 -Code QE200012`
   → file `submit/QE200012.zip` (package.json ở cấp cao nhất, không có `node_modules`, `.next`, `.git`, `.env*`).
6. Tạo `QE200012.docx` theo template, bỏ vào cùng thư mục `submit/`, rồi nộp thư mục đó.

---

## 4. Tóm tắt đề mẫu (SpendWise – FER202, FALL 2026)

**Tổng quan:** app ghi chi tiêu cá nhân. Route, text hiển thị và `data-testid` phải **đúng y hệt** đề.

### 2.1 Setup
- Next.js App Router + Tailwind + ShadCN (`components.json` ở gốc, dùng thật ≥ 2 component).
- `npm install` rồi `npm run build` chạy được chỉ với 2 biến `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase: tắt Confirm email, tạo 1 tài khoản test, setup DB như mục 2.2.

### 2.2 Database – bảng `expenses` (lưu SQL ở `supabase/expenses.sql`)
| Cột | Ý nghĩa |
|---|---|
| `id` | id duy nhất |
| `user_id` | id người dùng đang đăng nhập |
| `amount` | số tiền |
| `category` | Food, Transport, Shopping, Bills, Other |
| `spent_on` | ngày chi |
| `note` | ghi chú tùy chọn (mặc định rỗng) |
| `created_at` | thời điểm thêm |

DB phải tự từ chối dữ liệu sai: `amount > 0`; `category` thuộc 5 giá trị; `spent_on` bắt buộc; `note` ≤ 100 ký tự.
**RLS:** bật; user chỉ đọc/thêm/xóa dòng của mình; `user_id` của người khác bị từ chối; khách không đọc/ghi được.
Chỉ cấp quyền cần thiết, không tắt RLS, không dùng `service_role`.

### 2.3 Trang
- **`/` (public):** header có tên app + nút Login/Register (khi chưa đăng nhập); `home-title` = `SpendWise`, mô tả, ≥ 3 feature card.
  Khi đăng nhập: header hiện email, link tới expenses, nút Logout.
- **`/register`, `/login`:** form `noValidate`, thông báo tự viết; không hiện lỗi trước lần submit đầu; lỗi biến mất khi field hợp lệ.
  Register thành công → `form-success` = `Registration successful`; Login thành công → chuyển `/expenses`; lỗi Supabase → `error-auth`.

| Field | Khi | Thông báo |
|---|---|---|
| Email | rỗng / sai định dạng | `Email is required` / `Please enter a valid email address` |
| Password | rỗng / < 6 ký tự (Register) | `Password is required` / `Password must be at least 6 characters` |
| Confirm password | rỗng / không khớp | `Confirm password is required` / `Passwords do not match` |

- **`/expenses` (protected):** chưa đăng nhập → `/login`; không nháy nội dung khi đang kiểm tra phiên. Container `expenses-page`.
  - **A. Form thêm** (`expense-form`, `noValidate`): amount, category (option rỗng đầu "Choose category" + 5 loại), date, note.

    | Field | Rule | Thông báo |
    |---|---|---|
    | Amount | rỗng / 0 hoặc âm | `Amount is required` / `Amount must be greater than 0` |
    | Category | chưa chọn | `Please choose a category` |
    | Date | rỗng / sau hôm nay | `Date is required` / `Date cannot be in the future` |
    | Note | > 100 ký tự | `Note must be at most 100 characters` |

    Hợp lệ → lưu Supabase, hiện ngay đầu list không reload, reset form, `expense-success` = `Expense added`. Lỗi → `error-expense`.
  - **B. List:** mới nhất theo date trước (cùng ngày: thêm sau lên trước). Mỗi `expense-item`: category, amount dạng `$12.50`/`$1234.00`
    (2 số lẻ, không dấu phân cách nghìn), date `YYYY-MM-DD`, note, nút Delete. Rỗng → `expenses-empty` = `No expenses found`.
  - **C. Filter & summary** (cập nhật tức thì): filter category (All/5 loại) + month (`type="month"`, `YYYY-MM`, rỗng = tất cả), kết hợp AND; nút Clear.
    Summary theo dữ liệu đang hiển thị: `total-amount` (`$0.00` nếu rỗng), `expense-count` (số nguyên), breakdown theo category, tổng cao nhất trước.

### 2.4 Shared state
Expenses load 1 lần sau login, giữ trong **React Context** (form, list, filter, summary dùng chung, không truyền props).
Logout / đổi user → dữ liệu cũ phải biến mất.

### 2.5 Giao diện
375px không cuộn ngang; 1280px form và summary cạnh list. Dùng Tailwind + ≥ 2 component ShadCN.

### 3. `data-testid` bắt buộc
| Route | data-testid |
|---|---|
| header (logged out) | `btn-login`, `btn-register` |
| header (logged in) | `user-email`, `btn-logout`, `link-expenses` |
| `/` | `home-title` |
| `/login` | `login-form`, `login-email`, `login-password`, `login-submit` |
| `/register` | `register-form`, `register-email`, `register-password`, `register-confirm-password`, `register-submit` |
| messages login/register | `error-email`, `error-password`, `error-confirm-password` (register), `error-auth`, `form-success` (register) |
| `/expenses` | `expenses-page` |
| form | `expense-form`, `input-amount`, `select-category`, `input-date`, `input-note`, `btn-add-expense` |
| form messages | `error-amount`, `error-category`, `error-date`, `error-note`, `error-expense`, `expense-success` |
| list | `expense-list`, `expense-item`, `expenses-empty` |
| trong expense-item | `expense-category`, `expense-amount`, `expense-date`, `expense-note`, `btn-delete-expense` |
| filters | `filter-category` (value rỗng = All), `filter-month` (`type="month"`), `btn-clear-filters` |
| summary | `total-amount`, `expense-count`, `category-breakdown`, `breakdown-row` → `breakdown-name`, `breakdown-amount` |

Chỉ render phần tử error/success khi có thông báo. So sánh text chính xác (phân biệt hoa thường).

### 4. Nộp bài
- `QE200012.docx` (Word thật) theo template: Student Code, Full Name, GitHub Repository URL, Vercel Production URL,
  Supabase Project URL, Supabase anon key, Test account email/password.
- `QE200012.zip`: `package.json` ở cấp cao nhất, lock file, `app/`, `components/`, `public/`, `components.json`,
  `supabase/expenses.sql`, `.env.example`. Không có `node_modules`, `.next`, `.git`, `.env` thật.
- Repo GitHub public, cùng code với zip; link Vercel production, tắt Vercel Authentication; env đã set & redeploy.

### 5. Tự kiểm tra
- Register email mới được ngay; đăng ký trùng → hiện lỗi Supabase ở `error-auth`.
- Logged out vào `/expenses` → `/login`; login xong → `/expenses`, header hiện email + Logout.
- Submit form rỗng → đủ 4 lỗi; không hiện lúc mới load.
- Thêm expense → lên đầu ngay, đúng format; refresh vẫn còn.
- 3 expense / 2 category / 2 tháng: filter, total, count, breakdown đúng; Clear reset.
- Xóa → mất cả sau refresh; table editor chỉ thấy dòng của mình.
- Logout rồi login tài khoản khác → list rỗng.
- `npm install && npm run build` chạy được ở bản giải nén mới chỉ với 2 biến env.
- Zip không có `node_modules`, `.next`, `.git`, `.env`; 2 file cùng tên mã SV, cùng thư mục.
