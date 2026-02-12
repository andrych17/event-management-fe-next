# GMS Frontend

Frontend for Event Management System built with Next.js 15, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Deploy**: Vercel

## Struktur Folder

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Halaman publik (event display)
│   ├── login/
│   │   └── page.tsx              # Halaman login admin
│   ├── admin/
│   │   ├── page.tsx              # Dashboard admin
│   │   ├── event/
│   │   │   └── page.tsx          # Manajemen event
│   │   └── configs/
│   │       └── page.tsx          # Manajemen lokasi & lantai
│   └── preview/
│       └── page.tsx              # Preview tampilan publik
│
├── components/
│   ├── EventDisplay.tsx          # Tampilan list event hari ini
│   ├── PromoSlideshow.tsx        # Slideshow promo otomatis
│   ├── PaginationBullets.tsx     # Navigasi halaman event
│   ├── FloorMapModal.tsx         # Modal cek ketersediaan lantai
│   └── admin/
│       ├── Sidebar.tsx           # Navigasi sidebar admin
│       ├── EventForm.tsx         # Form create/edit event
│       ├── EventList.tsx         # Tabel list event
│       ├── PreviewModal.tsx      # Modal preview tampilan publik
│       ├── ConfirmDialog.tsx     # Dialog konfirmasi hapus
│       └── NotificationDialog.tsx # Toast notifikasi
│
├── contexts/
│   └── AuthContext.tsx           # State autentikasi global
│
├── lib/
│   ├── api.ts                    # Axios instance + semua API calls + TypeScript interfaces
│   └── dateFormat.ts             # Utility format tanggal & waktu
│
└── public/                       # Static assets
```

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build production bundle
npm start      # Start production server
npm run lint   # Run ESLint
```

## Fitur

### Tampilan Publik (`/`)
- Event hari ini (timezone WIB), 2 event per halaman
- Slideshow promo otomatis tiap 5 detik
- Auto-refresh halaman tiap 5 menit

### Authentication (`/login`)
- Login dengan email dan password
- Token disimpan di localStorage
- Auto-logout saat token expired (401)

### Admin Dashboard (`/admin`)
- Navigasi ke Event dan Configs management

### Event Management (`/admin/event`)
- CRUD event lengkap
- Search, filter lokasi/lantai/tanggal, sorting
- Pagination
- Cek ketersediaan lantai
- Preview tampilan publik

### Config Management (`/admin/configs`)
- Kelola hierarki Lokasi → Lantai
- Toggle active/inactive
- Proteksi: config yang dipakai event tidak bisa dihapus

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL backend API | `http://localhost:8000` |

## Notes

- Menggunakan App Router (bukan Pages Router)
- Autentikasi via Sanctum opaque token (bukan JWT)
- Semua API call terpusat di `lib/api.ts`
- Token di-attach otomatis via Axios request interceptor
